/**
 * IOA Commons: creates the two Google Forms and their response sheets.
 *
 * How to use (once):
 *   1. Go to https://script.google.com and choose "New project".
 *   2. Delete the sample code, paste in this whole file, and press Save.
 *   3. In the function list at the top, pick "createIoaCommonsForms" and press Run.
 *   4. Google asks for permission to manage your forms and sheets. Allow it.
 *   5. When it finishes, open View > Logs (or the Execution log). It lists the
 *      links you need. Copy them into _config.yml as the README explains.
 *
 * Run it only once. Running it again makes a second copy of everything.
 *
 * What it makes, in your Google Drive:
 *   - "IOA commons catalogue entry" form, linked to the "IOA commons catalogue responses"
 *     sheet. The sheet has an Approved tick box column and a Public tab that holds
 *     approved rows only, in the columns the Catalogue page reads.
 *   - "IOA commons request form" for suggestions, shared materials, corrections,
 *     removals and enquiries, linked to the "IOA commons requests" sheet with Status,
 *     Owner, Team notes and Last updated columns.
 *   - Two small automatic steps: each new catalogue response gets a tick box,
 *     and each new request gets the status "New".
 */

// The Catalogue page reads these column names from the Public tab. Do not change them.
var PUBLIC_COLUMNS = [
  "name", "title", "institution", "country", "faculty_or_school", "discipline",
  "unit_code", "unit_name", "year_level", "assessment_type", "cohort_size",
  "length_minutes", "weighting_percent", "year_started", "assessment_format",
  "contact_public", "profile_url", "resource_url"
];

var RESPONSES_TAB = "Form responses 1";
var CATALOGUE_APPROVED_COLUMN = 21; // column U: timestamp + 18 answers + consent, then Approved
var REQUEST_STATUSES = ["New", "In progress", "Waiting for submitter", "Done", "Closed"];

function createIoaCommonsForms() {
  var catalogue = createCatalogueForm_();
  var requests = createRequestForm_();

  Logger.log("Done. Copy these links:");
  Logger.log("google_form_url (catalogue form):  " + catalogue.form.getPublishedUrl());
  Logger.log("intake_form_url (request form):    " + requests.form.getPublishedUrl());
  Logger.log("Catalogue sheet (for you, not the site): " + catalogue.sheet.getUrl());
  Logger.log("Request sheet (for you, not the site):   " + requests.sheet.getUrl());
  Logger.log("Last step by hand: in the catalogue sheet, File > Share > Publish to web, " +
             "choose the Public tab and CSV, and copy that link into catalog_sheet_csv_url.");
}

// ---------------------------------------------------------------------------
// 1. Catalogue entry form
// ---------------------------------------------------------------------------

function createCatalogueForm_() {
  var form = FormApp.create("IOA commons catalogue entry");
  form.setTitle("Add your oral assessment to the IOA Commons catalogue")
    .setDescription(
      "The IOA Commons catalogue lists educators who run oral assessments, so colleagues " +
      "with a similar unit can find and contact them. It covers interactive oral " +
      "assessment (IOA), viva-style examinations and hybrid formats.\n\n" +
      "Your answers will be published on the IOA Commons website after the team checks them. " +
      "Only fill in what you are happy to have published. Optional questions can be left empty.\n\n" +
      "If your assessment combines features of more than one format (for example an " +
      "Honours viva run like an IOA), choose \"Hybrid oral assessment\" and describe it " +
      "in the question about how it works.\n\n" +
      "It takes about five minutes.")
    .setCollectEmail(false)
    .setAllowResponseEdits(false)
    .setLimitOneResponsePerUser(false)
    .setPublishingSummary(false)
    .setShowLinkToRespondAgain(true)
    .setConfirmationMessage(
      "Thank you. The team will check your entry, and it will appear in the IOA Commons " +
      "catalogue once approved. To change or remove it later, use the request form " +
      "on the IOA Commons Contribute page.");

  // The order below matches the PUBLIC_COLUMNS order. Do not reorder.
  text_(form, "Name", "As you want it shown, including a title such as Dr if you use one.", true);
  text_(form, "Position title", "For example: Senior Lecturer.", false);
  text_(form, "Institution", "", true);
  text_(form, "Country", "", true);
  text_(form, "Faculty or school", "", false);
  text_(form, "Discipline", "For example: Microbiology.", true);
  text_(form, "Unit code", "The code of the unit, subject or course that uses the oral assessment.", false);
  text_(form, "Unit name", "", false);
  list_(form, "Year level",
    ["1st year", "2nd year", "3rd year", "4th year or Honours", "Postgraduate", "Other"], false);
  list_(form, "Assessment type",
    ["Interactive oral assessment (IOA)", "Viva or oral examination",
     "Hybrid oral assessment", "Other oral assessment"], true);
  number_(form, "Number of students",
    "About how many students take this assessment each time it runs. A number only.", 1, 100000);
  number_(form, "Typical length of this assessment, in minutes",
    "A number only.", 1, 600);
  number_(form, "Weighting, as a percentage of the unit mark",
    "A number only, from 0 to 100.", 0, 100);
  number_(form, "Year you started using this assessment in this unit",
    "For example: 2023.", 1950, 2100);
  form.addParagraphTextItem()
    .setTitle("How the assessment works")
    .setHelpText("One or two sentences. For example: \"One-to-one conversation in person, " +
                 "set in a hospital laboratory scenario. Six markers run sessions in " +
                 "parallel over one week.\"")
    .setRequired(true);
  text_(form, "Public contact (optional)",
    "An email address or link that people can use to contact you. It will be shown on the " +
    "website. Leave empty to publish no contact.", false);
  text_(form, "Profile link (optional)", "Your staff profile page or similar.", false);
  text_(form, "Resource link (optional)",
    "A link to a rubric, guide or paper about your assessment.", false);
  form.addCheckboxItem()
    .setTitle("Consent")
    .setChoiceValues(["I agree to these details being published on IOA Commons"])
    .setRequired(true);

  // Response sheet.
  var sheet = SpreadsheetApp.create("IOA commons catalogue responses");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  var responses = findResponsesTab_(sheet.getId());

  responses.getRange(1, CATALOGUE_APPROVED_COLUMN).setValue("Approved").setFontWeight("bold");
  responses.getRange(1, CATALOGUE_APPROVED_COLUMN)
    .setNote("Tick to publish this row on the Catalogue page. Untick to hide it.");
  responses.setFrozenRows(1);

  // Public tab: approved rows only, public columns only (no timestamp, no consent).
  var publicTab = sheet.insertSheet("Public");
  publicTab.getRange(1, 1, 1, PUBLIC_COLUMNS.length).setValues([PUBLIC_COLUMNS]);
  publicTab.getRange("A2").setFormula(
    "=IFERROR(FILTER('" + RESPONSES_TAB + "'!B2:S, '" + RESPONSES_TAB + "'!U2:U = TRUE), \"\")");
  publicTab.setFrozenRows(1);
  publicTab.getRange("A1").setNote(
    "Do not type in this tab. It fills itself from the approved rows in '" + RESPONSES_TAB + "'.");

  removeDefaultTab_(sheet);

  ScriptApp.newTrigger("addApprovalTickBox")
    .forSpreadsheet(sheet)
    .onFormSubmit()
    .create();

  return { form: form, sheet: sheet };
}

// Runs automatically for each new catalogue response: adds an empty Approved tick box.
function addApprovalTickBox(e) {
  var row = e.range.getRow();
  e.range.getSheet().getRange(row, CATALOGUE_APPROVED_COLUMN).insertCheckboxes();
}

// ---------------------------------------------------------------------------
// 2. Request form (suggestions, shared materials, corrections, removals, enquiries)
// ---------------------------------------------------------------------------

function createRequestForm_() {
  var form = FormApp.create("IOA commons request form");
  form.setTitle("IOA Commons request form")
    .setDescription(
      "Use this form to suggest a publication or video, share draft or working materials, " +
      "ask for a catalogue entry to be corrected or removed, report a problem with the " +
      "website, or ask the team a question.\n\n" +
      "To add yourself to the catalogue, use the catalogue form on the Contribute page instead.\n\n" +
      "Please leave out sensitive personal or student information.")
    .setCollectEmail(false)
    .setAllowResponseEdits(false)
    .setLimitOneResponsePerUser(false)
    .setPublishingSummary(false)
    .setShowLinkToRespondAgain(true)
    .setConfirmationMessage(
      "Thank you. The team will look at your request. If you left an email address, " +
      "we will reply when it is done or if we have a question.");

  list_(form, "What is your request about?", [
    "A publication or useful link (already published elsewhere)",
    "A video",
    "Draft or working materials to share (slides, workshop materials, templates)",
    "Correct or remove a catalogue entry",
    "A problem with the website (broken link, mistake, accessibility)",
    "A general question",
    "Something else"
  ], true);
  text_(form, "Short title",
    "The title of the publication, video or material, or a few words about the request.", true);
  text_(form, "Link (if relevant)",
    "The page, publication or video. For materials to share, a sharing link to the file " +
    "(Google Drive, OneDrive, Dropbox or similar) set so that anyone with the link can view it.",
    false);
  form.addParagraphTextItem()
    .setTitle("Tell us what you need")
    .setHelpText(
      "For materials: who made them, who they are for (staff, students or both), and whether " +
      "they are a draft. For a catalogue correction: the name and institution shown in the " +
      "catalogue and what should change. For a problem: what you expected and what you saw.")
    .setRequired(true);
  text_(form, "Your name", "", false);
  form.addTextItem()
    .setTitle("Your email, if you would like a reply")
    .setHelpText("Used only to reply to this request. It is not published.")
    .setValidation(FormApp.createTextValidation()
      .setHelpText("Please enter an email address, or leave this empty.")
      .requireTextIsEmail()
      .build())
    .setRequired(false);
  form.addParagraphTextItem()
    .setTitle("Licence (for materials you are sharing)")
    .setHelpText("We recommend CC BY 4.0, which lets others reuse the work if they credit the " +
                 "authors. Leave empty if this does not apply.")
    .setRequired(false);
  form.addCheckboxItem()
    .setTitle("Permission (for materials or videos you are sharing)")
    .setChoiceValues([
      "I have the right to share this, and it contains no confidential, personal or student information"
    ])
    .setRequired(false);

  var sheet = SpreadsheetApp.create("IOA commons requests");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  var responses = findResponsesTab_(sheet.getId());

  // Team columns to the right of the answers (timestamp + 8 answers = columns A to I).
  var firstTeamColumn = 10; // column J
  responses.getRange(1, firstTeamColumn, 1, 4)
    .setValues([["Status", "Owner", "Team notes", "Last updated"]])
    .setFontWeight("bold");
  responses.getRange(2, firstTeamColumn, responses.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(REQUEST_STATUSES, true).build());
  responses.getRange(2, firstTeamColumn + 3, responses.getMaxRows() - 1, 1)
    .setNumberFormat("d mmm yyyy");
  responses.getRange(1, firstTeamColumn + 2)
    .setNote("Internal notes for the team. Never publish this sheet.");
  responses.setFrozenRows(1);

  removeDefaultTab_(sheet);

  ScriptApp.newTrigger("markNewRequest")
    .forSpreadsheet(sheet)
    .onFormSubmit()
    .create();

  return { form: form, sheet: sheet };
}

// Runs automatically for each new request: sets Status to "New" and the date.
function markNewRequest(e) {
  var row = e.range.getRow();
  var tab = e.range.getSheet();
  tab.getRange(row, 10).setValue("New");
  tab.getRange(row, 13).setValue(new Date());
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function text_(form, title, help, required) {
  var item = form.addTextItem().setTitle(title).setRequired(required);
  if (help) item.setHelpText(help);
  return item;
}

function list_(form, title, choices, required) {
  return form.addListItem().setTitle(title).setChoiceValues(choices).setRequired(required);
}

function number_(form, title, help, min, max) {
  return form.addTextItem()
    .setTitle(title)
    .setHelpText(help)
    .setValidation(FormApp.createTextValidation()
      .setHelpText("Please enter a number from " + min + " to " + max + ".")
      .requireNumberBetween(min, max)
      .build())
    .setRequired(false);
}

// Linking a form adds a responses tab. Find it and give it a fixed name.
function findResponsesTab_(sheetId) {
  for (var attempt = 0; attempt < 10; attempt++) {
    SpreadsheetApp.flush();
    var tabs = SpreadsheetApp.openById(sheetId).getSheets();
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].getFormUrl()) {
        tabs[i].setName(RESPONSES_TAB);
        return tabs[i];
      }
    }
    Utilities.sleep(1000);
  }
  throw new Error("Could not find the form responses tab. Please try again.");
}

// A new spreadsheet starts with an empty "Sheet1" tab. Remove it.
function removeDefaultTab_(sheet) {
  var ss = SpreadsheetApp.openById(sheet.getId());
  ss.getSheets().forEach(function (tab) {
    var unused = !tab.getFormUrl() && tab.getName() !== "Public" && tab.getLastRow() === 0;
    if (unused && ss.getSheets().length > 1) ss.deleteSheet(tab);
  });
}
