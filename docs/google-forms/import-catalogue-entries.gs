/**
 * IOA Commons: submit prepared catalogue entries through the catalogue Google Form.
 *
 * Use this when you have several entries ready (for example from a survey) and each
 * person has agreed to be listed. Each ready row is sent as a normal form response,
 * so it lands in "Form responses 1" with an Approved tick box, exactly like an entry
 * someone typed in themselves. Nothing goes live until you tick Approved.
 *
 * Set up (once):
 *   1. Open the "IOA commons catalogue responses" Google Sheet.
 *   2. Extensions > Apps Script. Delete any sample code, paste in this whole file, Save.
 *   3. Reload the sheet. A menu called "IOA Commons" appears.
 *
 * Each time:
 *   1. Add a tab called "Import" (or clear the old one). Row 1 holds the column names.
 *      Columns A to R must be the 18 catalogue questions, with the exact question titles
 *      below. Then two more columns: "Consent date" and "Import status". Any further
 *      columns (private notes) are ignored.
 *   2. Fill in "Consent date" only for people who have agreed to their row as written.
 *      Rows without a consent date are skipped.
 *   3. Choose IOA Commons > Submit ready rows from Import tab. The first time, Google
 *      asks for permission: choose your account, then Advanced > Go to project, then Allow.
 *   4. Each submitted row gets "Submitted <date>" in "Import status" and is never sent
 *      twice. A row with a problem gets "Error: ..." there; fix it, clear the status, run again.
 *   5. Check the new rows in "Form responses 1" and tick Approved for each one.
 *
 * The Import tab holds unpublished details and private notes. It is not part of the
 * published Public tab, but do not share the sheet with anyone outside the team.
 */

var IMPORT_TAB = "Import";
var RESPONSES_TAB = "Form responses 1";
var APPROVED_COLUMN = 21; // column U, as in create-forms.gs
var CONSENT_DATE_HEADER = "Consent date";
var STATUS_HEADER = "Import status";
var CONSENT_QUESTION = "Consent";
var CONSENT_CHOICE = "I agree to these details being published on IOA Commons";

// The catalogue form's questions, in form order. Titles must match the live form exactly.
var QUESTIONS = [
  "Name", "Position title", "Institution", "Country", "Faculty or school", "Discipline",
  "Unit code", "Unit name", "Year level", "Assessment type", "Number of students",
  "Typical length of this assessment, in minutes",
  "Weighting, as a percentage of the unit mark",
  "Year you started using this assessment in this unit",
  "How the assessment works", "Public contact (optional)",
  "Profile link (optional)", "Resource link (optional)"
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("IOA Commons")
    .addItem("Submit ready rows from Import tab", "importCatalogueEntries")
    .addToUi();
}

function importCatalogueEntries() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var formUrl = ss.getFormUrl();
  if (!formUrl) throw new Error("This sheet is not linked to a form. Run this from the catalogue responses sheet.");
  var form = FormApp.openByUrl(formUrl);

  // Find each form question by its title.
  var items = {};
  form.getItems().forEach(function (item) { items[item.getTitle().trim()] = item; });
  var missing = QUESTIONS.concat([CONSENT_QUESTION]).filter(function (t) { return !items[t]; });
  if (missing.length) {
    throw new Error("These questions are not in the form (check the titles): " + missing.join("; "));
  }

  var tab = ss.getSheetByName(IMPORT_TAB);
  if (!tab) throw new Error('No tab called "' + IMPORT_TAB + '".');
  var values = tab.getDataRange().getDisplayValues();
  var header = values[0].map(function (h) { return String(h).trim(); });
  var col = {};
  header.forEach(function (h, i) { col[h] = i; });
  var needed = QUESTIONS.concat([CONSENT_DATE_HEADER, STATUS_HEADER]);
  var absent = needed.filter(function (h) { return col[h] === undefined; });
  if (absent.length) throw new Error("The Import tab is missing these columns: " + absent.join("; "));

  var ready = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (!String(row[col["Name"]]).trim()) continue;
    if (String(row[col[STATUS_HEADER]]).trim()) continue;      // already done or flagged
    if (!String(row[col[CONSENT_DATE_HEADER]]).trim()) continue; // no consent yet
    ready.push(r);
  }
  if (!ready.length) {
    ui.alert("No rows to submit. Rows need a consent date and an empty Import status.");
    return;
  }
  var go = ui.alert("Submit " + ready.length + " row(s) to the catalogue form?\n\n" +
    "They will appear in '" + RESPONSES_TAB + "' unapproved. Nothing goes live until you tick Approved.",
    ui.ButtonSet.OK_CANCEL);
  if (go !== ui.Button.OK) return;

  var sent = 0, failed = 0;
  ready.forEach(function (r) {
    var row = values[r];
    var statusCell = tab.getRange(r + 1, col[STATUS_HEADER] + 1);
    try {
      var response = form.createResponse();
      QUESTIONS.forEach(function (title) {
        var value = String(row[col[title]]).trim();
        var item = items[title];
        if (!value) {
          if (item.getType() !== FormApp.ItemType.SECTION_HEADER && isRequired_(item)) {
            throw new Error('"' + title + '" is required');
          }
          return;
        }
        response.withItemResponse(answer_(item, title, value));
      });
      response.withItemResponse(items[CONSENT_QUESTION].asCheckboxItem().createResponse([CONSENT_CHOICE]));
      response.submit();
      statusCell.setValue("Submitted " + Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "d MMM yyyy"));
      sent++;
    } catch (err) {
      statusCell.setValue("Error: " + err.message);
      failed++;
    }
  });

  addMissingTickBoxes_(ss);
  ui.alert(sent + " row(s) submitted, " + failed + " with errors (see Import status).\n\n" +
    "Check the new rows in '" + RESPONSES_TAB + "' and tick Approved to publish them.");
}

// Builds the answer for one question, checking it against the question type.
function answer_(item, title, value) {
  switch (item.getType()) {
    case FormApp.ItemType.TEXT:
      if (/number|length|weighting|year you started/i.test(title)) {
        var n = Number(value.replace(/,/g, ""));
        if (isNaN(n)) throw new Error('"' + title + '" must be a number, got "' + value + '"');
        value = String(n);
      }
      return item.asTextItem().createResponse(value);
    case FormApp.ItemType.PARAGRAPH_TEXT:
      return item.asParagraphTextItem().createResponse(value);
    case FormApp.ItemType.LIST:
      var list = item.asListItem();
      var choices = list.getChoices().map(function (c) { return c.getValue(); });
      if (choices.indexOf(value) === -1) {
        throw new Error('"' + value + '" is not a choice for "' + title + '". Use one of: ' + choices.join(", "));
      }
      return list.createResponse(value);
    case FormApp.ItemType.MULTIPLE_CHOICE:
      return item.asMultipleChoiceItem().createResponse(value);
    default:
      throw new Error('Question type of "' + title + '" is not handled by this script');
  }
}

function isRequired_(item) {
  switch (item.getType()) {
    case FormApp.ItemType.TEXT: return item.asTextItem().isRequired();
    case FormApp.ItemType.PARAGRAPH_TEXT: return item.asParagraphTextItem().isRequired();
    case FormApp.ItemType.LIST: return item.asListItem().isRequired();
    case FormApp.ItemType.MULTIPLE_CHOICE: return item.asMultipleChoiceItem().isRequired();
    default: return false;
  }
}

// The form trigger normally adds the Approved tick box. In case it did not run for
// scripted responses, add one to any response row that lacks it.
function addMissingTickBoxes_(ss) {
  SpreadsheetApp.flush();
  Utilities.sleep(3000); // give the form a moment to write the new rows
  var sheet = ss.getSheetByName(RESPONSES_TAB);
  var last = sheet.getLastRow();
  if (last < 2) return;
  var stamps = sheet.getRange(2, 1, last - 1, 1).getValues();
  var approved = sheet.getRange(2, APPROVED_COLUMN, last - 1, 1);
  var rules = approved.getDataValidations();
  for (var i = 0; i < stamps.length; i++) {
    if (stamps[i][0] && !rules[i][0]) sheet.getRange(i + 2, APPROVED_COLUMN).insertCheckboxes();
  }
}
