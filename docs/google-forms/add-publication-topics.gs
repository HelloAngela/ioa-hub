/**
 * IOA Commons: add a "Topics" question to the request form (run once).
 *
 * What it does
 *   1. Adds an optional tick-box question to "IOA commons request form", right after
 *      "Link (if relevant)", so people suggesting a publication, video or material
 *      can tick the topics it covers. The choices are the topic labels in
 *      _data/publication-tags.yml. Running it again updates the choices.
 *   2. Replaces the automation that marks each new request. The old one
 *      (markNewRequest in create-forms.gs) writes to fixed columns J and M; a new
 *      form question adds a column to the responses sheet, which can move Status
 *      and Last updated. The new one (markNewRequestByHeader) finds those columns
 *      by their headings, so it keeps working whatever columns are added.
 *
 * Ticked topics are suggestions. The team checks them before copying an entry
 * into _data/publications.yml.
 *
 * How to run it
 *   1. Go to script.google.com and open the project you used to run create-forms.gs.
 *      (If you cannot find it, open the "IOA commons requests" sheet and use
 *      Extensions > Apps Script instead; see step 5.)
 *   2. Add a new script file (+ next to Files > Script), name it
 *      add-publication-topics, and paste this whole file in. Save.
 *   3. Pick "addPublicationTopics" in the function list at the top and press Run.
 *      Allow the permissions it asks for (forms, sheets, Drive search, triggers).
 *   4. Open the request form and check the new question. Submit one test request and
 *      check the sheet: the new row should get Status "New" and today's date.
 *      Then delete the test row.
 *   5. Open script.google.com/home/triggers. There should be one trigger for the
 *      requests sheet, running markNewRequestByHeader. If you still see one running
 *      markNewRequest (this happens if you used a different project in step 1),
 *      delete it with the three-dot menu, or it will write into the wrong columns.
 *
 * Keep TOPIC_CHOICES the same as the labels in _data/publication-tags.yml.
 */

var REQUEST_SHEET_NAME = "IOA commons requests";
var TOPIC_QUESTION = "Topics (for a publication, video or material)";
var TOPIC_HELP =
  "Optional. Tick any that apply. The team checks these before anything is published.";
var INSERT_AFTER = "Link (if relevant)";
var TOPIC_CHOICES = [
  "Interactive orals (IOA)",
  "Vivas and oral exams",
  "Large classes",
  "Design and scenarios",
  "Marking and feedback",
  "Preparing students",
  "Staff training and workload",
  "AI and integrity",
  "Equity and wellbeing",
  "Online and blended"
];

function addPublicationTopics() {
  var sheet = findRequestSheet_();
  var formUrl = sheet.getFormUrl();
  if (!formUrl) throw new Error("The sheet \"" + REQUEST_SHEET_NAME + "\" is not linked to a form.");
  var form = FormApp.openByUrl(formUrl);

  // 1. Add the question, or update its choices if it is already there.
  var question = null;
  form.getItems(FormApp.ItemType.CHECKBOX).forEach(function (item) {
    if (item.getTitle() === TOPIC_QUESTION) question = item.asCheckboxItem();
  });
  if (question) {
    question.setChoiceValues(TOPIC_CHOICES).setHelpText(TOPIC_HELP);
    Logger.log("The topics question was already there. Its choices are now up to date.");
  } else {
    question = form.addCheckboxItem()
      .setTitle(TOPIC_QUESTION)
      .setHelpText(TOPIC_HELP)
      .setChoiceValues(TOPIC_CHOICES)
      .setRequired(false);
    var after = null;
    form.getItems().forEach(function (item) {
      if (item.getTitle() === INSERT_AFTER) after = item;
    });
    if (after) form.moveItem(question.getIndex(), after.getIndex() + 1);
    Logger.log("Added the topics question to the request form.");
  }

  // 2. Swap the "mark new request" automation for one that finds columns by heading.
  var removed = 0;
  var haveNew = false;
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    var handler = trigger.getHandlerFunction();
    if (handler === "markNewRequest") {
      ScriptApp.deleteTrigger(trigger);
      removed += 1;
    } else if (handler === "markNewRequestByHeader") {
      haveNew = true;
    }
  });
  if (!haveNew) {
    ScriptApp.newTrigger("markNewRequestByHeader").forSpreadsheet(sheet).onFormSubmit().create();
  }
  Logger.log(removed
    ? "Removed the old markNewRequest automation and set up markNewRequestByHeader."
    : "Set up markNewRequestByHeader. No old markNewRequest automation was found in this " +
      "project: check script.google.com/home/triggers and delete any markNewRequest trigger " +
      "left in another project.");

  // Check the headings the automation needs.
  var tab = responsesTab_(sheet);
  ["Status", "Last updated"].forEach(function (heading) {
    if (columnOf_(tab, heading) === -1) {
      Logger.log("Warning: no \"" + heading + "\" column heading found in \"" + tab.getName() + "\".");
    }
  });
}

// Runs automatically for each new request: sets Status to "New" and the date,
// finding both columns by their headings in row 1.
function markNewRequestByHeader(e) {
  var tab = e.range.getSheet();
  var row = e.range.getRow();
  var status = columnOf_(tab, "Status");
  var updated = columnOf_(tab, "Last updated");
  if (status !== -1) tab.getRange(row, status).setValue("New");
  if (updated !== -1) tab.getRange(row, updated).setValue(new Date());
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findRequestSheet_() {
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active && active.getName() === REQUEST_SHEET_NAME) return active;
  } catch (e) { /* not bound to a sheet */ }
  var files = DriveApp.getFilesByName(REQUEST_SHEET_NAME);
  var found = [];
  while (files.hasNext()) {
    var file = files.next();
    if (file.getMimeType() === MimeType.GOOGLE_SHEETS && !file.isTrashed()) found.push(file);
  }
  if (found.length !== 1) {
    throw new Error("Expected one Google Sheet named \"" + REQUEST_SHEET_NAME + "\", found " +
      found.length + ". Rename duplicates, or run this from the sheet (Extensions > Apps Script).");
  }
  return SpreadsheetApp.openById(found[0].getId());
}

// The tab linked to the form (normally "Form responses 1").
function responsesTab_(sheet) {
  var tabs = sheet.getSheets();
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].getFormUrl()) return tabs[i];
  }
  return tabs[0];
}

// Column number (1 = A) of a heading in row 1, or -1 if it is not there.
function columnOf_(tab, heading) {
  var headings = tab.getRange(1, 1, 1, tab.getLastColumn()).getValues()[0];
  for (var i = 0; i < headings.length; i++) {
    if (String(headings[i]).trim() === heading) return i + 1;
  }
  return -1;
}
