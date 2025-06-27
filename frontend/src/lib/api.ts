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

// Define error type for better type safety
interface ApiError {
  response?: {
    status: number;
    statusText: string;
    data: any;
  };
  request?: any;
  message: string;
}

// Utility function for consistent error handling
const handleApiError = (error: any, functionName: string): never => {
  console.error(`${functionName} error:`, error);

  const errorObj: ApiError = {
    response: undefined,
    request: undefined,
    message: `${functionName} failed`
  };

  if (error && typeof error === "object") {
    if (error.response) {
      errorObj.response = {
        status: error.response.status || 500,
        statusText: error.response.statusText || "Internal Server Error",
        data: error.response.data || { message: "Server error occurred" }
      };
    }
    
    if (error.request) {
      errorObj.request = error.request;
    }
    
    if (error.message) {
      errorObj.message = error.message;
    } else if (error.response?.data?.message) {
      errorObj.message = error.response.data.message;
    } else if (error.response?.statusText) {
      errorObj.message = error.response.statusText;
    }

    // Handle common deployment issues
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
};

export const loginMutationFn = async (
  data: loginType
): Promise<LoginResponseType> => {
  try {
    let requestConfig = {
      withCredentials: true, 
      headers: {"Content-Type": "application/json"}
    };

    const response = await API.post("/auth/login", data, requestConfig);
    
    console.log("Login response status:", response?.status);
    console.log("Login response data:", response?.data);
    
    if (!response || !response.data) {
      throw new Error("Invalid response from login API");
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Login API error:", error);

    if (
      (error && error.code === 'ERR_NETWORK') || 
      (error.message && error.message.includes('CORS')) ||
      (error.message && error.message.includes('credentials')) ||
      (!error.response && !error.request)
    ) {
      console.log("Retrying login without credentials due to CORS/network issue");
      try {
        const retryResponse = await API.post("/auth/login", data, {
          headers: {"Content-Type": "application/json"}
        });
        if (!retryResponse || !retryResponse.data) {
          throw new Error("Invalid response from login API on retry");
        }
        return retryResponse.data;
      } catch (retryError: any) {
        console.error("Login retry also failed:", retryError);
        error = retryError;
      }
    }

    // Safely handle error object and avoid destructuring if undefined
    if (error && error.response && error.response.data) {
      handleApiError(error, "Login");
    } else {
      handleApiError({ message: error?.message || "Unknown login error" }, "Login");
    }
    throw error; // This line will never be reached, but is required for type safety
  }
};

export const registerMutationFn = async (data: registerType): Promise<any> => {
  try {
    const response = await API.post("/auth/register", data, {
      withCredentials: true, 
      headers: {"Content-Type": "application/json"}
    });
    
    if (!response || !response.data) {
      throw new Error("Invalid response from register API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Register");
    throw error; // Ensure the error is always thrown for the caller to handle
  }
};

export const logoutMutationFn = async (): Promise<any> => {
  try {
    const response = await API.get("/auth/logout", {withCredentials: true});
    console.log("This is the value of the response of the logout api");
    
    if (!response || !response.data) {
      throw new Error("Invalid response from logout API");
    }
    
    return response.data;
  } catch (error: any) {
    console.log("This is the error of the logoutMutation function", error);
    handleApiError(error, "Logout");
  }
};

export const getCurrentUserQueryFn = async (): Promise<CurrentUserResponseType> => {
  try {
    const response = await API.get(`/user/current`, {
      withCredentials: true, 
      headers: {"Content-Type": "application/json"}
    });
    
    if (!response || !response.data) {
      throw new Error("Invalid response from getCurrentUser API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Get Current User");
    throw error; // Ensure function always returns or throws
  }
};

//********* WORKSPACE ****************

export const createWorkspaceMutationFn = async (
  data: CreateWorkspaceType
): Promise<CreateWorkspaceResponseType> => {
  try {
    const response = await API.post(`/workspace/create/new`, data, {
      withCredentials: true, 
      headers: {"Content-Type": "application/json"}
    });
    
    if (!response || !response.data) {
      throw new Error("Invalid response from createWorkspace API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Create Workspace");
    throw error; // Ensure function always throws or returns
  }
};

export const editWorkspaceMutationFn = async ({
  workspaceId,
  data,
}: EditWorkspaceType): Promise<any> => {
  try {
    const response = await API.put(`/workspace/update/${workspaceId}`, data, {
      withCredentials: true, 
      headers: {"Content-Type": "application/json"}
    });
    
    if (!response || !response.data) {
      throw new Error("Invalid response from editWorkspace API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Edit Workspace");
  }
};

export const getAllWorkspacesUserIsMemberQueryFn = async (): Promise<AllWorkspaceResponseType> => {
  try {
    const response = await API.get(`/workspace/all`, {
      withCredentials: true, 
      headers: {"Content-Type": "application/json"}
    });
    
    if (!response || !response.data) {
      throw new Error("Invalid response from getAllWorkspaces API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Get All Workspaces");
    throw error; // Ensure function always throws or returns
  }
};

export const getWorkspaceByIdQueryFn = async (
  workspaceId: string
): Promise<WorkspaceByIdResponseType> => {
  try {
    const response = await API.get(`/workspace/${workspaceId}`, {
      withCredentials: true, 
      headers: {"Content-Type": "application/json"}
    });
    
    if (!response || !response.data) {
      throw new Error("Invalid response from getWorkspaceById API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Get Workspace By ID");
    throw error; // Ensure function always throws or returns
  }
};

export const getMembersInWorkspaceQueryFn = async (
  workspaceId: string
): Promise<AllMembersInWorkspaceResponseType> => {
  try {
    const response = await API.get(`/workspace/members/${workspaceId}`, {
      withCredentials: true, 
      headers: {"Content-Type": "application/json"}
    });
    
    if (!response || !response.data) {
      throw new Error("Invalid response from getMembersInWorkspace API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Get Members In Workspace");
    throw error;
  }
};

export const getWorkspaceAnalyticsQueryFn = async (
  workspaceId: string
): Promise<AnalyticsResponseType> => {
  try {
    const response = await API.get(`/workspace/analytics/${workspaceId}`, {
      withCredentials: true, 
      headers: {"Content-Type": "application/json"}
    });
    
    if (!response || !response.data) {
      throw new Error("Invalid response from getWorkspaceAnalytics API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Get Workspace Analytics");
    throw error;
  }
};

export const changeWorkspaceMemberRoleMutationFn = async ({
  workspaceId,
  data,
}: ChangeWorkspaceMemberRoleType): Promise<any> => {
  try {
    const response = await API.put(
      `/workspace/change/member/role/${workspaceId}`,
      data, 
      {withCredentials: true, headers: {"Content-Type": "application/json"}}
    );
    
    if (!response || !response.data) {
      throw new Error("Invalid response from changeWorkspaceMemberRole API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Change Workspace Member Role");
  }
};

export const deleteWorkspaceMutationFn = async (
  workspaceId: string
): Promise<{
  message: string;
  currentWorkspace: string;
}> => {
  try {
    const response = await API.delete(`/workspace/delete/${workspaceId}`, {
      withCredentials: true, 
      headers: {"Content-Type": "application/json"}
    });
    
    if (!response || !response.data) {
      throw new Error("Invalid response from deleteWorkspace API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Delete Workspace");
    // Ensure function always returns the expected type
    return Promise.reject(error);
  }
};

//*******MEMBER ****************

export const invitedUserJoinWorkspaceMutationFn = async (
  iniviteCode: string
): Promise<{
  message: string;
  workspaceId: string;
}> => {
  try {
    const response = await API.post(`/member/workspace/${iniviteCode}/join`, {}, {
      withCredentials: true, 
      headers: {"Content-Type": "application/json"}
    });
    
    if (!response || !response.data) {
      throw new Error("Invalid response from invitedUserJoinWorkspace API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Invited User Join Workspace");
    return Promise.reject(error);
  }
};

//********* PROJECTS

export const createProjectMutationFn = async ({
  workspaceId,
  data,
}: CreateProjectPayloadType): Promise<ProjectResponseType> => {
  try {
    const response = await API.post(
      `/project/workspace/${workspaceId}/create`,
      data,
      {withCredentials: true, headers: {"Content-Type": "application/json"}}
    );
    
    if (!response || !response.data) {
      throw new Error("Invalid response from createProject API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Create Project");
    throw error; // Ensure function always throws or returns
  }
};

export const editProjectMutationFn = async ({
  projectId,
  workspaceId,
  data,
}: EditProjectPayloadType): Promise<ProjectResponseType> => {
  try {
    const response = await API.put(
      `/project/${projectId}/workspace/${workspaceId}/update`,
      data,
      {withCredentials: true, headers: {"Content-Type": "application/json"}}
    );
    
    if (!response || !response.data) {
      throw new Error("Invalid response from editProject API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Edit Project");
    throw error; // Ensure function always throws or returns
  }
};

export const getProjectsInWorkspaceQueryFn = async ({
  workspaceId,
  pageSize = 10,
  pageNumber = 1,
}: AllProjectPayloadType): Promise<AllProjectResponseType> => {
  try {
    const response = await API.get(
      `/project/workspace/${workspaceId}/all?pageSize=${pageSize}&pageNumber=${pageNumber}`,
      {withCredentials: true, headers: {"Content-Type": "application/json"}}
    );
    
    if (!response || !response.data) {
      throw new Error("Invalid response from getProjectsInWorkspace API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Get Projects In Workspace");
    // Ensure function always returns the expected type
    return Promise.reject(error);
  }
};

export const getProjectByIdQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<ProjectResponseType> => {
  try {
    const response = await API.get(
      `/project/${projectId}/workspace/${workspaceId}`,
      {withCredentials: true, headers: {"Content-Type": "application/json"}}
    );
    
    if (!response || !response.data) {
      throw new Error("Invalid response from getProjectById API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Get Project By ID");
    // Ensure function always returns the expected type
    return Promise.reject(error);
  }
};

export const getProjectAnalyticsQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<AnalyticsResponseType> => {
  try {
    const response = await API.get(
      `/project/${projectId}/workspace/${workspaceId}/analytics`,
      {withCredentials: true, headers: {"Content-Type": "application/json"}}
    );
    
    if (!response || !response.data) {
      throw new Error("Invalid response from getProjectAnalytics API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Get Project Analytics");
    throw error; // Ensure function always throws or returns
  }
};

export const deleteProjectMutationFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<{
  message: string;
}> => {
  try {
    const response = await API.delete(
      `/project/${projectId}/workspace/${workspaceId}/delete`,
      {withCredentials: true, headers: {"Content-Type": "application/json"}}
    );
    
    if (!response || !response.data) {
      throw new Error("Invalid response from deleteProject API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Delete Project");
    // Ensure function always returns the expected type
    return Promise.reject(error);
  }
};

//*******TASKS ********************************

export const createTaskMutationFn = async ({
  workspaceId,
  projectId,
  data,
}: CreateTaskPayloadType): Promise<any> => {
  try {
    const response = await API.post(
      `/task/project/${projectId}/workspace/${workspaceId}/create`,
      data,
      {withCredentials: true, headers: {"Content-Type": "application/json"}}
    );
    
    if (!response || !response.data) {
      throw new Error("Invalid response from createTask API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Create Task");
  }
};

export const editTaskMutationFn = async ({
  taskId,
  projectId,
  workspaceId,
  data,
}: EditTaskPayloadType): Promise<{message: string;}> => {
  try {
    const response = await API.put(
      `/task/${taskId}/project/${projectId}/workspace/${workspaceId}/update/`,
      data,
      {withCredentials: true, headers: {"Content-Type": "application/json"}}
    );
    
    if (!response || !response.data) {
      throw new Error("Invalid response from editTask API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Edit Task");
    // Ensure function always returns the expected type
    return Promise.reject(error);
  }
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
  try {
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
    const response = await API.get(url, {
      withCredentials: true, 
      headers: {"Content-Type": "application/json"}
    });
    
    if (!response || !response.data) {
      throw new Error("Invalid response from getAllTasks API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Get All Tasks");
    // The following line is unreachable, but ensures type safety
    return Promise.reject(error);
  }
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
  try {
    const response = await API.delete(
      `task/${taskId}/workspace/${workspaceId}/delete`,
      {withCredentials: true, headers: {"Content-Type": "application/json"}}
    );
    
    if (!response || !response.data) {
      throw new Error("Invalid response from deleteTask API");
    }
    
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Delete Task");
    return Promise.reject(error);
  }
};