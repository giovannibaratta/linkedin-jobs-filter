const parentNode = document.body;

// Class name of the root <div> element that contains the list of all the jobs for a given search
const jobsResultDivClassName =
  "jobs-search-results-list\n          \n          ";

// Class name of the <ul> element that contains all the jobs for a given search
const unorderedListContainerClassName = "scaffold-layout__list-container";

// Class name of the <li> elements that contain the details of a specific job
const listItemContainerClassName =
  "ember-view   jobs-search-results__list-item occludable-update p0 relative scaffold-layout__list-item";

// Class name of the <span> element that contains the company name of a job item
const spanCompanyNameClassName = "job-card-container__primary-description ";

// Inject the CSS style that will be used to customize the job list items

var jobListItemHiddenStyle = `
    .undesiredJob {
        background-color: red;
        visibility: hidden;
    }
`;

var jobListItemHiddenStyleSheet = document.createElement("style");
jobListItemHiddenStyleSheet.textContent = jobListItemHiddenStyle;
document.head.appendChild(jobListItemHiddenStyleSheet);

var observer = new MutationObserver(function (mutations) {
  // Search in the DOM the main div that contains the list of jobs that LinkedIn found for
  // a specific search
  const jobResultDiv = findDivByClassName(jobsResultDivClassName);

  if (jobResultDiv === null || jobResultDiv === undefined) {
    console.error("root job result div not found");
    return;
  }

  // Since the DIV have been found, we want to inspect every single entry and filter them
  jobPointers = extractJobsFromResultDiv(jobResultDiv);
  //alterDom(jobResultDiv);
});

// Observe any changes that happens in parentNode
observer.observe(parentNode, {
  childList: true,
  subtree: true, // needed if the node you're targeting is not the direct parent
});

function findDivByClassName(className) {
  const allDivs = document.querySelectorAll("div");
  return Array.from(allDivs).find((div) => div.classList.value === className);
}

function extractJobsFromResultDiv(jobResultListRootDiv) {
  const unorderedLists = jobResultListRootDiv.querySelectorAll("ul");
  const unorderedListContainer = Array.from(unorderedLists).find(
    (ul) => ul.classList.value === unorderedListContainerClassName
  );

  if (unorderedListContainer === null || unorderedListContainer === undefined) {
    console.error(
      "Unordered list container not found in job result list root div"
    );
    return;
  }

  const listItems = unorderedListContainer.querySelectorAll("li");
  const jobListItems = Array.from(listItems).filter(
    (li) => li.classList.value === listItemContainerClassName
  );

  const jobInfos = jobListItems.map((it) => extractJobInfoFromJobListItem(it));
  const jobsToRemove = filterUndesiredJobs(jobInfos);

  for (const job of jobsToRemove) {
    job.htmlPointer.remove();
  }
}

function filterUndesiredJobs(jobInfos) {
  const undesiredJobs = [];

  for (const job of jobInfos) {
    if (job.company === "Canonical") {
      undesiredJobs.push(job);
    }
  }

  return undesiredJobs;
}

class JobInfo {
  constructor(info) {
    this.jobName = info.jobName;
    this.company = info.company;
    this.htmlPointer = info.htmlPointer;
  }
}

function extractJobInfoFromJobListItem(jobListItem) {
  // There should be only one strong element containing the job name
  const strongs = Array.from(jobListItem.querySelectorAll("strong"));
  // One of the span should contain the company name
  const spans = jobListItem.querySelectorAll("span");

  const jobName = removeNewLinesAndExtraWhiteSpaces(strongs[0].textContent);

  const companyNameSpan = Array.from(spans).find(
    (span) => span.classList.value === spanCompanyNameClassName
  );

  return new JobInfo({
    jobName: jobName,
    company: removeNewLinesAndExtraWhiteSpaces(companyNameSpan.textContent),
    htmlPointer: jobListItem,
  });
}

function removeNewLinesAndExtraWhiteSpaces(stringValue) {
  return stringValue.replace(/\n/g, "").trim();
}
