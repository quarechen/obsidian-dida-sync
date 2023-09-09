import axios, { AxiosRequestConfig } from 'axios';
import { Notice,requestUrl } from 'obsidian';

export type TaskItem = {
    id: string;
    projectId: string;
    sortOrder: number;
    title: string;
    exDate: any[];
    repeatTaskId: any;
    content: string;
    repeatFrom: any;
    desc: string;
    timeZone: string;
    isFloating: boolean;
    isAllDay: boolean;
    reminder: string;
    reminders: any[];
    priority: number;
    status: number;
    items: any[];
    progress: number;
    attachments: Array<{
      createdTime: string;
      fileName: string;
      fileType: string;
      id: string;
      path: string;
      size: number;
    }>;
    dueDate?: string;
    modifiedTime: string;
    etag: string;
    deleted: number;
    createdTime: string;
    creator: number;
    focusSummaries: any[];
    commentCount: number;
    columnId: string;
    kind: string;
    deletedTime: number;
    tags: string[];
  };

class Dida365Api {
  private email: string;
  private password: string;
  private cookies: string[] = [];
  private cookieHeader: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }


  public async login() {
    const json_data = { username: this.email, password: this.password };
    const url = 'https://api.dida365.com/api/v2/user/signon?wc=true&remember=true'
    const result = requestUrl({
        url,
        body: JSON.stringify(json_data),
        headers: {
          'Content-Type': 'application/json',
          'x-device': '{"platform":"web","os":"macOS 10.15.7","device":"Chrome 114.0.0.0","name":"","version":4562,"id":"64217d45c3630d2326189adc","channel":"website","campaign":"","websocket":""}',
        },
        method: 'POST',
      })
      .then(result => {
        this.cookies = (result.headers['set-cookie'] as unknown as string[]) ?? [];
        this.cookieHeader = this.cookies.join('; ') + ';';
      })
      .catch(e => {
        console.log(e);
        new Notice('登录失败');
      });

    return result;
  }

  public async getAllTasks(){
    await this.login();
    const url = `https://api.dida365.com/api/v2/batch/check/0`;
    const result = await requestUrl({
      url,
      headers: {
        Cookie: this.cookieHeader,
      },
      method: 'GET',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    }).then(r => r.json);

    return result.syncTaskBean.update as TaskItem[];
  }

  public async getTasks(project_id: string){
    let tasks = await this.getAllTasks()
    return tasks.filter((task) => task.projectId === project_id);
  }

  public async completeTask(task: TaskItem)  {
    task.status = 2;
    const req = {
      add: [],
      addAttachments: [],
      delete: [],
      deleteAttachments: [],
      update: [task],
      updateAttachments: [],
    };
    const url = 'https://api.dida365.com/api/v2/batch/task/';
    const result = await requestUrl({
      url,
      headers: {
        Cookie: this.cookieHeader,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(req),
    }).then(r => r.json);
    console.log("completeTask:",result);
    return result
  }

  public projectURL(task:TaskItem){
    return `https://dida365.com/webapp/#p/${task.projectId}/tasks`
  }
  public taskURL(task:TaskItem){
    return `https://dida365.com/webapp/#p/${task.projectId}/tasks/${task.id}`
  }
}

export default Dida365Api;