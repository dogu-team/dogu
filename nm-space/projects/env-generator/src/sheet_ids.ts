export const CONSOLE_WEB_FRONT_SPREADSHEET_ID = '1SL1fcos9C08eYUDVap8KyRleJfnRQQ5rDlGui1Z9MVw';
export const CONSOLE_WEB_SERVER_SPREADSHEET_ID = '1Zjb17qSaKKhuBDdssYL-cg2SNf9UroAeHX-CwMg6-r0';
export const HOST_AGENT_SPREADSHEET_ID = '166HkuXoAoS5n_vnkMfuZHIHv-tGeCNVX4KjG-TM6aK0';
export const DEIVCE_SERVER_SPREADSHEET_ID = '1xRW7XT00vr7SQsy9m-tmApAv01hXOmsYDZ__R-RWkeo';
export const E2E_SPREADSHEET_ID = '1ex2TaEBXhnI0DXIbEUSUGk3a9aXeYwc4k4v5gBe1iJM';
export const DEPLOY_SECRET_SPREADSHEET_ID = '1KjnmJGnoH5nnFF6llarU9VQl-iT46QEb7-3X4br9lps';
export const DOST_SPREADSHEET_ID = '1Y7eFRzdHRkQHAqZCqjt0V5jjDyuhr-shpBfdzvG_rDE';

interface Project {
  path: string;
  sheets: Sheet[];
}

interface Sheet {
  name: string;
  id: string;
}

const projectNameToSheet: {
  [key: string]: Project;
} = {
  'console-web-front': {
    path: 'projects/console-web-front',
    sheets: [{ name: '.env.local', id: CONSOLE_WEB_FRONT_SPREADSHEET_ID }],
  },
  'console-web-server': {
    path: 'projects/console-web-server',
    sheets: [{ name: '.env.local', id: CONSOLE_WEB_SERVER_SPREADSHEET_ID }],
  },
  'dogu-agent': {
    path: 'projects/dogu-agent',
    sheets: [
      { name: '.env.host-agent', id: HOST_AGENT_SPREADSHEET_ID },
      { name: '.env.device-server', id: DEIVCE_SERVER_SPREADSHEET_ID },
    ],
  },
  e2e: {
    path: 'e2e',
    sheets: [{ name: '.env.local', id: E2E_SPREADSHEET_ID }],
  },
  dost: {
    path: 'nm-space/projects/dost',
    sheets: [
      { name: '.env.dost', id: DOST_SPREADSHEET_ID },
      { name: '.env.deploy-secret', id: DEPLOY_SECRET_SPREADSHEET_ID },
      { name: '.env.host-agent', id: HOST_AGENT_SPREADSHEET_ID },
      { name: '.env.device-server', id: DEIVCE_SERVER_SPREADSHEET_ID },
    ],
  },
};
export function findIdFromProjectName(name: string): Sheet[] {
  if (name in projectNameToSheet) {
    return projectNameToSheet[name as keyof typeof projectNameToSheet].sheets;
  }
  throw new Error(`Unknown project name: ${name}, valid names are \n >> [${Object.keys(projectNameToSheet).join(', ')}]`);
}

export function getAllProjectNameToSheet() {
  return projectNameToSheet;
}
