import API from "./axios-client";
import {
  AllMembersInWorkspaceResponseType,
  AllProjectPayloadType,
  AllProjectResponseType,
  AllTaskPayloadType,
  AllTaskResponseType,
  AnalyticsResponseType,
  ChangeWorkspaceMemberRoleType,
  CreateProjectPayloadType,
  CreateTaskPayloadType,
  EditTaskPayloadType,
  CreateWorkspaceResponseType,
  EditProjectPayloadType,
  ProjectByIdPayloadType,
  ProjectResponseType,
} from "../types/api.type";
import {
  AllWorkspaceResponseType,
  CreateWorkspaceType,
  CurrentUserResponseType,
  LoginResponseType,
  loginType,
  registerType,
  WorkspaceByIdResponseType,
  EditWorkspaceType,
} from "@/types/api.type";





export const loginMutationFn = async (
  data: loginType
): Promise<LoginResponseType> => {
  try {
    // Try with credentials first
    let requestConfig = {
      withCredentials: true, 
      headers: {"Content-Type": "application/json"}
    };

    const response = await API.post("/auth/login", data, requestConfig);
    
    // Add logging to see what's happening
    console.log("Login response status:", response?.status);
    console.log("Login response data:", response?.data);
    
    // Check if response and response.data exist
    if (!response || !response.data) {
      throw new Error("Invalid response from login API");
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Login API error:", error);

    // Check if it's a CORS/credentials issue and retry without credentials
    if (error && error.code === 'ERR_NETWORK' || 
        (error.message && error.message.includes('CORS')) ||
        (error.message && error.message.includes('credentials')) ||
        (!error.response && !error.request)) {
      
      console.log("Retrying login without credentials due to CORS/network issue");
      
      try {
        const retryResponse = await API.post("/auth/login", data, {
          headers: {"Content-Type": "application/json"}
          // withCredentials removed for retry
        });
        
        if (!retryResponse || !retryResponse.data) {
          throw new Error("Invalid response from login API on retry");
        }
        
        return retryResponse.data;
      } catch (retryError: any) {
        console.error("Login retry also failed:", retryError);
        // Continue with original error handling below
        error = retryError;
      }
    }

    // Create a standardized error object
    const errorObj = {
      response: undefined as any,
      request: undefined as any,
      message: "Login failed"
    };

    // Safely extract error information
    if (error && typeof error === "object") {
      // Check if error.response exists and has data
      if (error.response) {
        errorObj.response = {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data || { message: "Server error occurred" }
        };
      }
      
      // Set request if available
      if (error.request) {
        errorObj.request = error.request;
      }
      
      // Set message with better error descriptions
      if (error.message) {
        errorObj.message = error.message;
      } else if (error.response?.data?.message) {
        errorObj.message = error.response.data.message;
      } else if (error.response?.statusText) {
        errorObj.message = error.response.statusText;
      }

      // Specific error messages for common deployment issues
      if (error.code === 'ERR_NETWORK') {
        errorObj.message = "Network error: Unable to connect to the server. Please check your connection.";
      } else if (error.message?.includes('CORS')) {
        errorObj.message = "Cross-origin request blocked. Please contact support.";
      } else if (!error.response && error.request) {
        errorObj.message = "Server is not responding. Please try again later.";
      } else if (!error.response && !error.request) {
        errorObj.message = "Request configuration error. Please refresh and try again.";
      }
    } else if (typeof error === "string") {
      errorObj.message = error;
    }

    throw errorObj;
  }
};





export const registerMutationFn = async (data: registerType) =>
  await API.post("/auth/register", data, {withCredentials: true, headers : {"Content-Type" : "application/json"}});



export const logoutMutationFn = async () =>{
  try {
    const response = await API.get("/auth/logout", {withCredentials: true});
    console.log("This is the value of the response of the logout api ")
    return response.data
  } catch (error) {
    console.log("This is the error of the logoutMutation function", error);
  }
} 
  

export const getCurrentUserQueryFn =
  async (): Promise<CurrentUserResponseType> => {
    const response = await API.get(`/user/current`, {withCredentials: true, headers : {"Content-Type" : "application/json"}});
    return response.data;
  };

//********* WORKSPACE ****************
//************* */

export const createWorkspaceMutationFn = async (
  data: CreateWorkspaceType
): Promise<CreateWorkspaceResponseType> => {
  const response = await API.post(`/workspace/create/new`, data, {withCredentials: true, headers : {"Content-Type" : "application/json"}});
  return response.data;
};

export const editWorkspaceMutationFn = async ({
  workspaceId,
  data,
}: EditWorkspaceType) => {
  const response = await API.put(`/workspace/update/${workspaceId}`, data, {withCredentials: true, headers : {"Content-Type" : "application/json"}});
  return response.data;
};

export const getAllWorkspacesUserIsMemberQueryFn =
  async (): Promise<AllWorkspaceResponseType> => {
    const response = await API.get(`/workspace/all`, {withCredentials: true, headers : {"Content-Type" : "application/json"}});
    return response.data;
  };

export const getWorkspaceByIdQueryFn = async (
  workspaceId: string
): Promise<WorkspaceByIdResponseType> => {
  const response = await API.get(`/workspace/${workspaceId}`, {withCredentials: true, headers : {"Content-Type" : "application/json"}});
  return response.data;
};

export const getMembersInWorkspaceQueryFn = async (
  workspaceId: string
): Promise<AllMembersInWorkspaceResponseType> => {
  const response = await API.get(`/workspace/members/${workspaceId}`, {withCredentials: true, headers : {"Content-Type" : "application/json"}});
  return response.data;
};

export const getWorkspaceAnalyticsQueryFn = async (
  workspaceId: string
): Promise<AnalyticsResponseType> => {
  const response = await API.get(`/workspace/analytics/${workspaceId}`, {withCredentials: true, headers : {"Content-Type" : "application/json"}});
  return response.data;
};

export const changeWorkspaceMemberRoleMutationFn = async ({
  workspaceId,
  data,
}: ChangeWorkspaceMemberRoleType) => {
  const response = await API.put(
    `/workspace/change/member/role/${workspaceId}`,
    data, 
    {withCredentials: true, headers : {"Content-Type" : "application/json"}}
  );
  return response.data;
};

export const deleteWorkspaceMutationFn = async (
  workspaceId: string
): Promise<{
  message: string;
  currentWorkspace: string;
}> => {
  const response = await API.delete(`/workspace/delete/${workspaceId}`, {withCredentials: true, headers : {"Content-Type" : "application/json"}});
  return response.data;
};

//*******MEMBER ****************

export const invitedUserJoinWorkspaceMutationFn = async (
  iniviteCode: string
): Promise<{
  message: string;
  workspaceId: string;
}> => {
  const response = await API.post(`/member/workspace/${iniviteCode}/join`, {withCredentials: true, headers : {"Content-Type" : "application/json"}});
  return response.data;
};

//********* */
//********* PROJECTS
export const createProjectMutationFn = async ({
  workspaceId,
  data,
}: CreateProjectPayloadType): Promise<ProjectResponseType> => {
  const response = await API.post(
    `/project/workspace/${workspaceId}/create`,
    data,
    {withCredentials: true, headers : {"Content-Type" : "application/json"}}
  );
  return response.data;
};

export const editProjectMutationFn = async ({
  projectId,
  workspaceId,
  data,
}: EditProjectPayloadType): Promise<ProjectResponseType> => {
  const response = await API.put(
    `/project/${projectId}/workspace/${workspaceId}/update`,
    data,
    {withCredentials: true, headers : {"Content-Type" : "application/json"}}
  );
  return response.data;
};

export const getProjectsInWorkspaceQueryFn = async ({
  workspaceId,
  pageSize = 10,
  pageNumber = 1,
}: AllProjectPayloadType): Promise<AllProjectResponseType> => {
  const response = await API.get(
    `/project/workspace/${workspaceId}/all?pageSize=${pageSize}&pageNumber=${pageNumber}`,
    {withCredentials: true, headers : {"Content-Type" : "application/json"}}
  );
  return response.data;
};

export const getProjectByIdQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<ProjectResponseType> => {
  const response = await API.get(
    `/project/${projectId}/workspace/${workspaceId}`,
    {withCredentials: true, headers : {"Content-Type" : "application/json"}}
  );
  return response.data;
};

export const getProjectAnalyticsQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<AnalyticsResponseType> => {
  const response = await API.get(
    `/project/${projectId}/workspace/${workspaceId}/analytics`,
    {withCredentials: true, headers : {"Content-Type" : "application/json"}}
  );
  return response.data;
};

export const deleteProjectMutationFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<{
  message: string;
}> => {
  const response = await API.delete(
    `/project/${projectId}/workspace/${workspaceId}/delete`,
        {withCredentials: true, headers : {"Content-Type" : "application/json"}}
  );
  return response.data;
};

//*******TASKS ********************************
//************************* */

export const createTaskMutationFn = async ({
  workspaceId,
  projectId,
  data,
}: CreateTaskPayloadType) => {
  const response = await API.post(
    `/task/project/${projectId}/workspace/${workspaceId}/create`,
    data,
        {withCredentials: true, headers : {"Content-Type" : "application/json"}}
  );
  return response.data;
};


export const editTaskMutationFn = async ({
  taskId,
  projectId,
  workspaceId,
  data,
}: EditTaskPayloadType): Promise<{message: string;}> => {
  const response = await API.put(
    `/task/${taskId}/project/${projectId}/workspace/${workspaceId}/update/`,
    data,
        {withCredentials: true, headers : {"Content-Type" : "application/json"}}
  );
  return response.data;
};

export const getAllTasksQueryFn = async ({
  workspaceId,
  keyword,
  projectId,
  assignedTo,
  priority,
  status,
  dueDate,
  pageNumber,
  pageSize,
}: AllTaskPayloadType): Promise<AllTaskResponseType> => {
  const baseUrl = `/task/workspace/${workspaceId}/all`;

  const queryParams = new URLSearchParams();
  if (keyword) queryParams.append("keyword", keyword);
  if (projectId) queryParams.append("projectId", projectId);
  if (assignedTo) queryParams.append("assignedTo", assignedTo);
  if (priority) queryParams.append("priority", priority);
  if (status) queryParams.append("status", status);
  if (dueDate) queryParams.append("dueDate", dueDate);
  if (pageNumber) queryParams.append("pageNumber", pageNumber?.toString());
  if (pageSize) queryParams.append("pageSize", pageSize?.toString());

  const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl;
  const response = await API.get(url,     {withCredentials: true, headers : {"Content-Type" : "application/json"}});
  return response.data;
};

export const deleteTaskMutationFn = async ({
  workspaceId,
  taskId,
}: {
  workspaceId: string;
  taskId: string;
}): Promise<{
  message: string;
}> => {
  const response = await API.delete(
    `task/${taskId}/workspace/${workspaceId}/delete`,
        {withCredentials: true, headers : {"Content-Type" : "application/json"}}
  );
  return response.data;
};
