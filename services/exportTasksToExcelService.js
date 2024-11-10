// working with dates
const dayjs = require("dayjs");
const localizedFormat = require("dayjs/plugin/localizedFormat");
const georgianLocale = require("dayjs/locale/ka");

const excelJs = require("exceljs");
const Task = require("../models/taskModel");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const AppError = require("../utils/AppError");

// Initialize Dayjs
dayjs.extend(localizedFormat); // Extend dayjs functionality
dayjs.locale("ka"); // Set to Georgian

// @desc   convert JSON data to Excel format
// @route  POST /api/v1/tasks/export-tasks
// @access Private
const convertJsonToExcel = asyncMiddleware(async (req, res, next) => {
  const user = req.user;
  const filters = req.body;

  // Work tipe title translation
  const workType =
    filters?.recurrence === "monthly" ? "თვის დეკლარაციები" : "წლის დეკლარაციები";
  // Parse `targetPeriod` as a date and define the start and end of that day
  const targetDate = new Date(filters.targetPeriod);
  const nextDay = new Date(targetDate);
  nextDay.setDate(targetDate.getDate() + 1); // Next day in UTC

  // Retrieve all tasks that match the filters
  const tasks = await Task.find({
    user: user._id,
    recurrence: filters.recurrence,
    targetPeriod: { $gte: targetDate, $lt: nextDay },
    archived: filters.archived,
  }).populate("organization");

  // Filter out tasks that do not have an associated organization
  const validOrganizations = tasks.reduce((acc, task) => {
    if (task.organization) {
      let org = acc.find((o) => o._id.equals(task.organization._id));
      if (org) {
        org.tasks.push(task); // Append task to existing organization
      } else {
        acc.push({
          ...task.organization.toObject(),
          tasks: [task], // Add tasks array with this task
        });
      }
    }
    return acc;
  }, []);

  if (validOrganizations.length === 0) {
    return next(new AppError("No organizations with valid task criteria found", 400));
  }

  // Initialize Excel workbook and sheet
  const workbook = new excelJs.Workbook();
  const sheet = workbook.addWorksheet(workType, {
    pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 },
  });

  // Generate header columns dynamically
  const { columns, taskNames } = generateHeaderColumns(validOrganizations);
  sheet.columns = columns;

  // Populate the Excel sheet rows with data for each organization
  validOrganizations.forEach((org, index) => {
    const mainRowData = generateRowData(org, index);
    const mainOrgRow = sheet.addRow(mainRowData);
    formatTaskRow(mainOrgRow, org, taskNames);
  });

  // Set all column widths based on content length
  setColumnWidths(sheet);

  // Display title at the top of the document
  displayTitle(workType, filters, sheet);

  // Apply formatting to headers
  applyFormatting(sheet);

  // Set response headers for Excel file download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filters.documentName || "work_excel"}.xlsx"`
  );

  // Write the workbook to response and end the response
  await workbook.xlsx.write(res);
  res.end();
});
// Generate columns based on unique task titles and prepare the header
const generateHeaderColumns = (validOrganizations) => {
  const columns = [
    { header: "#", key: "index" },
    { header: "დასახელება", key: "orgName" },
    { header: "პორტალები", key: "webData" },
  ];

  const taskNames = new Set();
  validOrganizations.forEach((org) => {
    org.tasks.forEach((task) => taskNames.add(task.title));
  });

  // Convert the Set to an array and add task titles as columns
  Array.from(taskNames).forEach((taskTitle, index) => {
    columns.push({
      header: taskTitle,
      key: `task${index + 1}`,
    });
  });

  return { columns, taskNames };
};

// Generate row data for each organization, including task details
const generateRowData = (org, index) => {
  const WebData = org.websites
    .map(
      (website) =>
        `${website.name}: \n ${website.identificationCodeRecord} \n ${website.passwordRecord}`
    )
    .join("\n");

  return {
    index: index + 1, // Row index
    orgName: `${org.type}-${org.name}`, // Organization name
    webData: WebData, // Website data
  };
};

// Display title at the top of the document
const displayTitle = (workType, filters, sheet) => {
  const date = dayjs(filters?.targetPeriod);
  const targetPeriod = date.format("MMMM,YYYY");
  const titleText = `${workType} / ${targetPeriod}`;

  sheet.insertRow(1, { orgName: titleText });
  // Stretch it in to multiple cells
  sheet.mergeCells("B1:D1");
};

// Dynamically adjust column widths based on content length
const setColumnWidths = (sheet) => {
  sheet.columns.forEach((column) => {
    // Initial cell size based on it's header
    let initialSize = column.header ? column.header.toString().length : 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellLength = cell.value ? cell.value.toString().length : 0;
      if (cellLength > initialSize) initialSize = cellLength;
    });
    column.width = initialSize + 5;
    if (column.header === "დასახელება") {
      if (column.width > 10) column.width += 5;
    }
  });
};

// Apply cell formatting for each row based on task status
const formatTaskRow = (row, org, taskNames) => {
  Array.from(taskNames).forEach((taskTitle, taskIndex) => {
    const taskMap = new Map(org.tasks.map((task) => [task.title, task]));
    const task = taskMap.get(taskTitle);
    const columnKey = `task${taskIndex + 1}`;
    const cell = row.getCell(columnKey);

    if (!task) {
      cell.value = "არა";
      cell.alignment = { vertical: "middle", horizontal: "center" };
    } else {
      if (task.status === "completed") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF00FF00" },
        };
      } else {
        cell.value = "";
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" },
        };
      }
    }
  });
  // Add style to all occupied cells
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
};

// Format the headers
const applyFormatting = (sheet) => {
  // Styling Columns
  sheet.getColumn("webData").width = 17;
  sheet.getColumn("index").alignment = { vertical: "middle", horizontal: "center" };
  sheet.getColumn("webData").alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  // Styling Rows
  // initial each row height
  sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    row.height = 15;
  });

  // Style top title
  const titleRow = sheet.getRow(1);
  titleRow.height = 25;
  titleRow.font = { name: "Arial", size: 12, bold: true };
  titleRow.alignment = { vertical: "top", horizontal: "left" };

  // Style main headers row
  const headerRow = sheet.getRow(2);
  headerRow.height = 30;
  headerRow.alignment = { vertical: "bottom", horizontal: "center", wrapText: true };
  headerRow.font = { name: "Arial", size: 11, bold: true };
};

module.exports = convertJsonToExcel;
