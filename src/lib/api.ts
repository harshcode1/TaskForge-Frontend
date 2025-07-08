import axios, { AxiosInstance } from 'axios'
import toast from 'react-hot-toast'

// Helper function to handle API errors
const handleApiError = (error: unknown, defaultMessage: string): never => {
  const errorMessage = error instanceof Error ? error.message : defaultMessage
  throw new Error(errorMessage)
}

export interface User {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'MANAGER' | 'MEMBER'
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  ownerId: string
  members?: ProjectMember[]
  tasks?: Task[]
}

export interface ProjectCreateRequest {
  name: string
  description: string
}

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  userEmail: string
  role: 'OWNER' | 'MANAGER' | 'MEMBER'
  joinedAt: string
  user?: User
}

export interface ProjectMemberInviteRequest {
  projectId: string
  userEmail: string
  role: 'OWNER' | 'MANAGER' | 'MEMBER'
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  dueDate: string | null
  assigneeEmail: string | null
  createdAt: string
  updatedAt: string
  assignee?: User
  comments?: Comment[]
}

export interface TaskCreateRequest {
  projectId: string
  title: string
  description: string
  dueDate?: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  assigneeEmail?: string
}

export interface TaskUpdateRequest {
  title?: string
  description?: string
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  dueDate?: string
  assigneeEmail?: string
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  text: string
  createdAt: string
  user?: User
}

export interface CommentCreateRequest {
  taskId: string
  text: string
}

export interface DashboardStats {
  totalTasks: number
  pendingTasks: number
  completedTasks: number
}

class ApiClient {
  private instance: AxiosInstance
  private token: string | null = null
  private user: User | null = null

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:6060/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout()
          toast.error('Session expired. Please login again.')
        }
        return Promise.reject(error)
      }
    )

    // Initialize from localStorage
    this.initializeFromStorage()
  }

  private initializeFromStorage() {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('taskforge_token')
      const storedUser = localStorage.getItem('taskforge_user')
      
      if (storedToken && storedUser) {
        try {
          this.token = storedToken
          this.user = JSON.parse(storedUser)
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          this.logout()
        }
      }
    }
  }

  private setAuthData(token: string, user: User) {
    this.token = token
    this.user = user
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskforge_token', token)
      localStorage.setItem('taskforge_user', JSON.stringify(user))
    }
  }

  // Authentication APIs
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.instance.post<AuthResponse>('/auth/login', credentials)
      const { token, user } = response.data
      this.setAuthData(token, user)
      return response.data
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      throw new Error(errorMessage)
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.instance.post<AuthResponse>('/auth/register', data)
      const { token, user } = response.data
      this.setAuthData(token, user)
      return response.data
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      throw new Error(errorMessage)
    }
  }

  logout() {
    this.token = null
    this.user = null
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('taskforge_token')
      localStorage.removeItem('taskforge_user')
    }
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user
  }

  getUser(): User | null {
    return this.user
  }

  getToken(): string | null {
    return this.token
  }

  // Project APIs
  async createProject(data: ProjectCreateRequest): Promise<Project> {
    try {
      const response = await this.instance.post<Project>('/projects', data)
      return response.data
    } catch (error: unknown) {
      return handleApiError(error, 'Failed to create project')
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      const response = await this.instance.get<Project[]>('/projects')
      return response.data
    } catch (error: unknown) {
      return handleApiError(error, 'Failed to fetch projects')
    }
  }

  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await this.instance.get<Project>(`/projects/${id}`)
      return response.data
    } catch (error: unknown) {
      return handleApiError(error, 'Failed to fetch project')
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.instance.delete(`/projects/${id}`)
    } catch (error: unknown) {
      handleApiError(error, 'Failed to delete project')
    }
  }

  // Project Members APIs
  async inviteProjectMember(data: ProjectMemberInviteRequest): Promise<ProjectMember> {
    try {
      const response = await this.instance.post<ProjectMember>('/project-members/invite', data)
      return response.data
    } catch (error: unknown) {
      return handleApiError(error, 'Failed to invite member')
    }
  }

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    try {
      const response = await this.instance.get<ProjectMember[]>(`/project-members/${projectId}`)
      return response.data
    } catch (error: unknown) {
      return handleApiError(error, 'Failed to fetch project members')
    }
  }

  // Task APIs
  async createTask(data: TaskCreateRequest): Promise<Task> {
    try {
      const response = await this.instance.post<Task>('/tasks', data)
      return response.data
    } catch (error: unknown) {
      return handleApiError(error, 'Failed to create task')
    }
  }

  async updateTask(id: string, data: TaskUpdateRequest): Promise<Task> {
    try {
      const response = await this.instance.put<Task>(`/tasks/${id}`, data)
      return response.data
    } catch (error: unknown) {
      return handleApiError(error, 'Failed to update task')
    }
  }

  async getTasksForProject(projectId: string, status?: string): Promise<Task[]> {
    try {
      const url = status ? `/tasks/project/${projectId}?status=${status}` : `/tasks/project/${projectId}`
      const response = await this.instance.get<Task[]>(url)
      return response.data
    } catch (error: unknown) {
      return handleApiError(error, 'Failed to fetch tasks')
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await this.instance.delete(`/tasks/${id}`)
    } catch (error: unknown) {
      handleApiError(error, 'Failed to delete task')
    }
  }

  // Comment APIs
  async addComment(data: CommentCreateRequest): Promise<Comment> {
    try {
      const response = await this.instance.post<Comment>('/comments/add', data)
      return response.data
    } catch (error: unknown) {
      return handleApiError(error, 'Failed to add comment')
    }
  }

  async getTaskComments(taskId: string): Promise<Comment[]> {
    try {
      const response = await this.instance.get<Comment[]>(`/comments/task/${taskId}`)
      return response.data
    } catch (error: unknown) {
      return handleApiError(error, 'Failed to fetch comments')
    }
  }

  // Dashboard APIs
  async getDashboardStats(projectId: string): Promise<DashboardStats> {
    try {
      const response = await this.instance.get<DashboardStats>(`/dashboard/${projectId}`)
      return response.data
    } catch (error: unknown) {
      return handleApiError(error, 'Failed to fetch dashboard stats')
    }
  }

  // Legacy method for backward compatibility
  async getTasks(): Promise<Task[]> {
    try {
      const response = await this.instance.get<Task[]>('/tasks')
      return response.data
    } catch (error: unknown) {
      return handleApiError(error, 'Failed to fetch tasks')
    }
  }
}

export const apiClient = new ApiClient()
export default apiClient

