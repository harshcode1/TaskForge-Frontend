'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Calendar,
  Users,
  MoreVertical,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  FolderOpen
} from 'lucide-react'

import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { formatDate, getInitials } from '@/lib/utils'

// Mock data for demonstration
const mockProjects = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Building a modern e-commerce solution with React and Node.js',
    status: 'In Progress',
    progress: 75,
    dueDate: '2024-02-15',
    createdAt: '2024-01-01',
    members: [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'OWNER' },
      { id: '2', name: 'Sarah Miller', email: 'sarah@example.com', role: 'MANAGER' },
      { id: '3', name: 'Alex Johnson', email: 'alex@example.com', role: 'MEMBER' }
    ],
    tasks: {
      total: 24,
      completed: 18,
      pending: 6
    },
    priority: 'High',
    isStarred: true
  },
  {
    id: '2',
    name: 'Mobile App Redesign',
    description: 'Complete redesign of the mobile application with new UI/UX',
    status: 'In Progress',
    progress: 45,
    dueDate: '2024-02-28',
    createdAt: '2024-01-10',
    members: [
      { id: '4', name: 'Mike Johnson', email: 'mike@example.com', role: 'OWNER' },
      { id: '5', name: 'Kate Lee', email: 'kate@example.com', role: 'MEMBER' }
    ],
    tasks: {
      total: 16,
      completed: 7,
      pending: 9
    },
    priority: 'Medium',
    isStarred: false
  },
  {
    id: '3',
    name: 'API Integration',
    description: 'Integrating third-party APIs for enhanced functionality',
    status: 'Review',
    progress: 90,
    dueDate: '2024-02-10',
    createdAt: '2024-01-05',
    members: [
      { id: '6', name: 'Robert Kim', email: 'robert@example.com', role: 'OWNER' },
      { id: '7', name: 'Tom Smith', email: 'tom@example.com', role: 'MEMBER' },
      { id: '8', name: 'Nina Patel', email: 'nina@example.com', role: 'MEMBER' }
    ],
    tasks: {
      total: 12,
      completed: 11,
      pending: 1
    },
    priority: 'High',
    isStarred: true
  },
  {
    id: '4',
    name: 'Documentation Update',
    description: 'Updating project documentation and user guides',
    status: 'Completed',
    progress: 100,
    dueDate: '2024-01-30',
    createdAt: '2024-01-15',
    members: [
      { id: '9', name: 'Lisa Wang', email: 'lisa@example.com', role: 'OWNER' }
    ],
    tasks: {
      total: 8,
      completed: 8,
      pending: 0
    },
    priority: 'Low',
    isStarred: false
  }
]

export default function ProjectsPage() {
  const [projects] = useState(mockProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || project.status.toLowerCase().replace(' ', '_') === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'Review':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <FolderOpen className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success'
      case 'In Progress':
        return 'info'
      case 'Review':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'warning'
      case 'low':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage and track your project progress
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Button variant="gradient" icon={<Plus className="h-4 w-4" />}>
              New Project
            </Button>
          </motion.div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        >
          <div className="flex flex-1 max-w-md">
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
            
            <div className="flex border border-gray-300 rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Projects Grid/List */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                >
                  <Link href={`/projects/${project.id}`}>
                    <Card className="h-full hover-lift cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <CardTitle className="text-lg">{project.name}</CardTitle>
                              {project.isStarred && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <CardDescription className="line-clamp-2">
                              {project.description}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(project.status)}
                            <Badge variant={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </div>
                          <Badge variant={getPriorityColor(project.priority)}>
                            {project.priority}
                          </Badge>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} variant="success" animated />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Due {formatDate(project.dueDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{project.members.length} members</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {project.members.slice(0, 3).map((member, idx) => (
                              <Avatar key={idx} size="sm" className="border-2 border-white">
                                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {project.members.length > 3 && (
                              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 border-2 border-white rounded-full text-xs font-medium text-gray-600">
                                +{project.members.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {project.tasks.completed}/{project.tasks.total} tasks
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                >
                  <Link href={`/projects/${project.id}`}>
                    <Card className="hover-lift cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                                {project.isStarred && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                )}
                              </div>
                              <p className="text-gray-600 text-sm">{project.description}</p>
                            </div>
                            
                            <div className="flex items-center space-x-6">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(project.status)}
                                <Badge variant={getStatusColor(project.status)}>
                                  {project.status}
                                </Badge>
                              </div>
                              
                              <div className="w-32">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-gray-600">Progress</span>
                                  <span className="font-medium">{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} variant="success" />
                              </div>
                              
                              <div className="flex -space-x-2">
                                {project.members.slice(0, 3).map((member, idx) => (
                                  <Avatar key={idx} size="sm" className="border-2 border-white">
                                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                      {getInitials(member.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {project.members.length > 3 && (
                                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 border-2 border-white rounded-full text-xs font-medium text-gray-600">
                                    +{project.members.length - 3}
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-sm text-gray-600 min-w-0">
                                <div>Due {formatDate(project.dueDate)}</div>
                                <div>{project.tasks.completed}/{project.tasks.total} tasks</div>
                              </div>
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center py-12"
          >
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first project'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button variant="gradient" icon={<Plus className="h-4 w-4" />}>
                Create Your First Project
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </MainLayout>
  )
}

