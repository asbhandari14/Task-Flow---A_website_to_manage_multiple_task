import axios from "axios";

// You may want to configure the baseURL as needed for your project
const API = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  withCredentials: true
});

// Updated handleApiError function with better safety checks
type ApiError = {
  response?: {
    status: number;
    statusText: string;
    data: any;
  };
  request?: any;
  message: string;
  code?: string;
};

// --- LOGOUT MUTATION FN ---
export const logoutMutationFn = async (): Promise<any> => {
  try {
    const response = await API.post("/auth/logout");
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Logout");
  }
};

// --- DELETE PROJECT MUTATION FN ---
export const deleteProjectMutationFn = async ({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}): Promise<any> => {
  try {
    const response = await API.delete(`/workspaces/${workspaceId}/projects/${projectId}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "DeleteProject");
  }
};

// --- GET ALL WORKSPACES USER IS MEMBER QUERY FN ---
export const getAllWorkspacesUserIsMemberQueryFn = async (): Promise<any> => {
  try {
    const response = await API.get("/workspaces");
    return response.data;
  } catch (error: any) {
    handleApiError(error, "GetAllWorkspacesUserIsMember");
  }
};

// --- CREATE WORKSPACE MUTATION FN ---
export const createWorkspaceMutationFn = async ({
  name,
  description,
}: {
  name: string;
  description: string;
}): Promise<any> => {
  try {
    const response = await API.post("/workspaces", { name, description });
    return response.data;
  } catch (error: any) {
    handleApiError(error, "CreateWorkspace");
  }
};

// --- EDIT WORKSPACE MUTATION FN ---
export const editWorkspaceMutationFn = async ({
  workspaceId,
  data,
}: {
  workspaceId: string;
  data: { name: string; description: string };
}): Promise<any> => {
  try {
    const response = await API.put(`/workspaces/${workspaceId}`, data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "EditWorkspace");
  }
};

const handleApiError = (error: any, functionName: string): never => {
  console.error(`${functionName} error:`, error);

  const errorObj: ApiError = {
    response: undefined,
    request: undefined,
    message: `${functionName} failed`
  };

  if (error && typeof error === "object") {
    // Safely check for response object
    if (error.response && typeof error.response === "object") {
      errorObj.response = {
        status: error.response.status || 500,
        statusText: error.response.statusText || "Internal Server Error",
        data: error.response.data || { message: "Server error occurred" }
      };
    }
    
    // Safely check for request object
    if (error.request) {
      errorObj.request = error.request;
    }
    
    // Determine the error message with fallbacks
    if (typeof error.message === "string" && error.message.trim()) {
      errorObj.message = error.message;
    } else if (error.response?.data?.message && typeof error.response.data.message === "string") {
      errorObj.message = error.response.data.message;
    } else if (error.response?.statusText && typeof error.response.statusText === "string") {
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

export type LoginResponseType = any; // TODO: Replace 'any' with the actual response type

// Define the loginType interface according to your login data structure
export interface loginType {
  email: string;
  password: string;
}

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

    // Check for network/CORS issues first
    const isNetworkError = (
      error?.code === 'ERR_NETWORK' || 
      error?.message?.includes('CORS') ||
      error?.message?.includes('credentials') ||
      (!error?.response && error?.request)
    );

    if (isNetworkError) {
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
        
        // Handle retry error safely - create a safe error object
        const safeRetryError: any = {
          message: "Login retry failed",
          response: undefined,
          request: undefined
        };

        // Safely extract error information
        if (retryError && typeof retryError === "object") {
          if (typeof retryError.message === "string") {
            safeRetryError.message = retryError.message;
          }
          if (retryError.response) {
            safeRetryError.response = retryError.response;
          }
          if (retryError.request) {
            safeRetryError.request = retryError.request;
          }
        } else if (typeof retryError === "string") {
          safeRetryError.message = retryError;
        }
        
        handleApiError(safeRetryError, "Login");
      }
    }

    // Handle the original error safely - create a safe error object
    const safeError: any = {
      message: "Unknown login error",
      response: undefined,
      request: undefined
    };

    // Safely extract error information
    if (error && typeof error === "object") {
      if (typeof error.message === "string") {
        safeError.message = error.message;
      }
      if (error.response) {
        safeError.response = error.response;
      }
      if (error.request) {
        safeError.request = error.request;
      }
      if (error.code) {
        safeError.code = error.code;
      }
    } else if (typeof error === "string") {
      safeError.message = error;
    }

    handleApiError(safeError, "Login");
  }
};