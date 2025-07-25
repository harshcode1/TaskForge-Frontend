'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import TaskModal from '@/components/tasks/TaskModal';
import ProjectAnalytics from '@/components/dashboard/ProjectAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectsAPI, tasksAPI, projectMembersAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import { Plus, Users, UserPlus, ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id;

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'MEMBER' });
  const [inviting, setInviting] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);

  useEffect(() => {
    console.log("params:", params);
    console.log("projectId:", projectId);

    if (!projectId) {
      console.error("Invalid projectId: Redirecting to /projects");
      toast.error("Invalid project URL");
      router.push("/projects");
      return;
    }

    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      // Fetch project details
      const projectResponse = await projectsAPI.getById(projectId);
      setProject(projectResponse.data);

      // Fetch tasks
      const tasksResponse = await tasksAPI.getByProject(projectId);
      setTasks(tasksResponse.data);

      // Fetch members
      try {
        const membersResponse = await projectMembersAPI.getMembers(projectId);
        console.log(membersResponse.data);
        setMembers(membersResponse.data);
      } catch (error) {
        console.error('Error fetching members:', error);
        setMembers([]);
      }

    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('Failed to load project data');
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    setTaskLoading(true);
    try {
      const response = await tasksAPI.create(
        projectId,
        taskData.title,
        taskData.description,
        taskData.dueDate,
        taskData.status,
        taskData.priority,
        taskData.assigneeEmail
      );
      setTasks([...tasks, response.data]);
      setTaskModalOpen(false);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    setTaskLoading(true);
    try {
      const response = await tasksAPI.update(taskId, taskData);
      setTasks(tasks.map(t => t.id === taskId ? response.data : t));
      setTaskModalOpen(false);
      setEditingTask(null);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await tasksAPI.delete(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleTaskSave = (taskData) => {
    if (editingTask) {
      handleUpdateTask(editingTask.id, taskData);
    } else {
      handleCreateTask(taskData);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    const email = inviteData.email.trim();

    if (!email) {
      toast.error('Email is required');
      return;
    }

    setInviting(true);
    try {
      const response = await projectMembersAPI.invite(projectId, email, inviteData.role);
      setMembers((prevMembers) => [...prevMembers, response.data]);
      setInviteData({ email: '', role: 'MEMBER' });
      setInviteModalOpen(false);
      toast.success('Member invited successfully!');
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'DONE').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const todo = tasks.filter(t => t.status === 'TODO').length;

    return { total, completed, inProgress, todo };
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'MEMBER':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Project not found</h1>
              <Link href="/projects">
                <Button className="mt-4">Back to Projects</Button>
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const stats = getTaskStats();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Link href="/projects">
              <Button variant="ghost" size="icon" className="mr-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground mt-1">
                {project.description || 'No description provided'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setTaskModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
              <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Invite a new member to collaborate on this project.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteMember}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          value={inviteData.email}
                          onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={inviteData.role} onValueChange={(value) => setInviteData({ ...inviteData, role: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="OWNER">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={inviting}>
                        {inviting ? 'Inviting...' : 'Send Invite'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">To Do</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="board" className="space-y-4">
            <TabsList>
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="board" className="space-y-4">
              <KanbanBoard
                tasks={tasks}
                onTaskUpdate={handleUpdateTask}
                onTaskEdit={handleTaskEdit}
                onTaskDelete={handleDeleteTask}
              />
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Members</CardTitle>
                  <CardDescription>
                    Manage team members and their roles in this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {members.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No members yet</p>
                      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite First Member
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{member.user?.name || member.email}</p>
                            <p className="text-sm text-muted-foreground">
                              Joined {new Date(member.joinedAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getRoleColor(member.role)}>
                            {member.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <ProjectAnalytics
                projectId={projectId}
                tasks={tasks}
                members={members}
              />
            </TabsContent>
          </Tabs>

          {/* Task Modal */}
          <TaskModal
            isOpen={taskModalOpen}
            onClose={() => {
              setTaskModalOpen(false);
              setEditingTask(null);
            }}
            onSave={handleTaskSave}
            task={editingTask}
            projectMembers={members.filter(member => member.role)}
            loading={taskLoading}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}

