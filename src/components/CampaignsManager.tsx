"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Play,
  Pause,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Target,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  Activity,
  CheckCircle2,
  Clock,
  PlayCircle,
  PauseCircle,
  FileText,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  totalLeads: number;
  successfulLeads: number;
  responseRate: number;
  createdDate: string;
  lastUpdated: string;
  budget?: number;
  spent?: number;
}

interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  averageResponseRate: number;
  totalLeads: number;
  totalSuccessful: number;
  overallConversionRate: number;
}

// Enhanced mock data with more campaigns and details
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Q4 Product Launch',
    description: 'Comprehensive outreach campaign for new product features and enterprise clients',
    status: 'active',
    totalLeads: 245,
    successfulLeads: 67,
    responseRate: 27.3,
    createdDate: '2024-01-15',
    lastUpdated: '2024-01-20',
    budget: 5000,
    spent: 3200
  },
  {
    id: '2',
    name: 'Enterprise Prospects',
    description: 'Targeting fortune 500 companies with personalized outreach',
    status: 'active',
    totalLeads: 89,
    successfulLeads: 23,
    responseRate: 25.8,
    createdDate: '2024-01-10',
    lastUpdated: '2024-01-19',
    budget: 8000,
    spent: 4500
  },
  {
    id: '3',
    name: 'Holiday Promotion',
    description: 'End of year special offers and seasonal campaigns',
    status: 'completed',
    totalLeads: 156,
    successfulLeads: 48,
    responseRate: 30.8,
    createdDate: '2023-12-01',
    lastUpdated: '2024-01-05',
    budget: 3000,
    spent: 2850
  },
  {
    id: '4',
    name: 'New Market Research',
    description: 'Exploring new market opportunities and potential customers',
    status: 'draft',
    totalLeads: 0,
    successfulLeads: 0,
    responseRate: 0,
    createdDate: '2024-01-20',
    lastUpdated: '2024-01-20',
    budget: 2500,
    spent: 0
  },
  {
    id: '5',
    name: 'Summer Campaign 2024',
    description: 'Seasonal marketing push for summer products and services',
    status: 'paused',
    totalLeads: 78,
    successfulLeads: 15,
    responseRate: 19.2,
    createdDate: '2024-01-08',
    lastUpdated: '2024-01-18',
    budget: 4000,
    spent: 1200
  },
  {
    id: '6',
    name: 'Customer Retention',
    description: 'Re-engagement campaign for existing customers',
    status: 'active',
    totalLeads: 134,
    successfulLeads: 52,
    responseRate: 38.8,
    createdDate: '2024-01-12',
    lastUpdated: '2024-01-21',
    budget: 3500,
    spent: 2100
  },
  {
    id: '7',
    name: 'Partnership Outreach',
    description: 'Building strategic partnerships with industry leaders',
    status: 'completed',
    totalLeads: 45,
    successfulLeads: 18,
    responseRate: 40.0,
    createdDate: '2023-11-15',
    lastUpdated: '2023-12-30',
    budget: 6000,
    spent: 5400
  },
  {
    id: '8',
    name: 'Mobile App Launch',
    description: 'Promoting new mobile application features',
    status: 'draft',
    totalLeads: 0,
    successfulLeads: 0,
    responseRate: 0,
    createdDate: '2024-01-22',
    lastUpdated: '2024-01-22',
    budget: 7500,
    spent: 0
  }
];

type SortField = 'name' | 'status' | 'createdDate' | 'totalLeads' | 'successfulLeads' | 'responseRate' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

// Status configuration with enhanced styling
const statusConfig = {
  draft: { 
    label: 'Draft', 
    color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', 
    dotColor: 'bg-gray-500',
    icon: FileText
  },
  active: { 
    label: 'Active', 
    color: 'bg-green-100 text-green-800 hover:bg-green-200', 
    dotColor: 'bg-green-500',
    icon: PlayCircle
  },
  paused: { 
    label: 'Paused', 
    color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', 
    dotColor: 'bg-yellow-500',
    icon: PauseCircle
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200', 
    dotColor: 'bg-blue-500',
    icon: CheckCircle2
  },
};

// Status Badge Component
const StatusBadge: React.FC<{ status: Campaign['status'] }> = ({ status }) => {
  const config = statusConfig[status];
  const IconComponent = config.icon;
  
  return (
    <Badge variant="secondary" className={`${config.color} font-medium flex items-center space-x-1`}>
      <IconComponent className="w-3 h-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

// Sortable Header Component
const SortableHeader: React.FC<{ 
  field: SortField; 
  children: React.ReactNode;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}> = ({ field, children, sortField, sortDirection, onSort }) => {
  const getSortIcon = () => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors select-none" 
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-2">
        <span>{children}</span>
        {getSortIcon()}
      </div>
    </TableHead>
  );
};

export default function CampaignsManager() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const [isLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeleteingCampaign] = useState<Campaign | null>(null);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);

  // Calculate enhanced stats
  const stats: CampaignStats = useMemo(() => {
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;
    const totalLeads = campaigns.reduce((sum, c) => sum + c.totalLeads, 0);
    const totalSuccessful = campaigns.reduce((sum, c) => sum + c.successfulLeads, 0);
    const avgResponseRate = campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + c.responseRate, 0) / campaigns.length 
      : 0;
    const overallConversionRate = totalLeads > 0 ? (totalSuccessful / totalLeads) * 100 : 0;

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns,
      completedCampaigns,
      averageResponseRate: avgResponseRate,
      totalLeads,
      totalSuccessful,
      overallConversionRate
    };
  }, [campaigns]);

  // Filtered and sorted campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;

    if (searchQuery) {
      filtered = filtered.filter(campaign =>
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    return filtered.sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'createdDate':
          return multiplier * (new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime());
        case 'lastUpdated':
          return multiplier * (new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime());
        case 'totalLeads':
          return multiplier * (a.totalLeads - b.totalLeads);
        case 'successfulLeads':
          return multiplier * (a.successfulLeads - b.successfulLeads);
        case 'responseRate':
          return multiplier * (a.responseRate - b.responseRate);
        case 'name':
          return multiplier * a.name.localeCompare(b.name);
        case 'status':
          return multiplier * a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [campaigns, searchQuery, statusFilter, sortField, sortDirection]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField, sortDirection]);

  const handleStatusChange = useCallback((campaignId: string, newStatus: 'active' | 'paused') => {
    toast.success(`Campaign ${newStatus === 'active' ? 'resumed' : 'paused'} successfully`);
  }, []);

  const handleDelete = useCallback((campaign: Campaign) => {
    setDeleteingCampaign(null);
    toast.success('Campaign deleted successfully');
  }, []);

  const handleEdit = useCallback((updatedCampaign: Campaign) => {
    setEditingCampaign(null);
    toast.success('Campaign updated successfully');
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressValue = (campaign: Campaign) => {
    if (campaign.totalLeads === 0) return 0;
    return Math.min((campaign.successfulLeads / campaign.totalLeads) * 100, 100);
  };

  const getProgressColor = (responseRate: number) => {
    if (responseRate >= 35) return 'bg-green-500';
    if (responseRate >= 25) return 'bg-yellow-500';
    if (responseRate >= 15) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardContent className="p-0">
            <div className="space-y-2 p-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="text-xs text-muted-foreground">
                {stats.activeCampaigns} Active • {stats.completedCampaigns} Completed
              </div>
            </div>
            <Progress value={100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {((stats.activeCampaigns / stats.totalCampaigns) * 100).toFixed(1)}% of total
            </div>
            <Progress 
              value={(stats.activeCampaigns / stats.totalCampaigns) * 100} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResponseRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              Overall: {stats.overallConversionRate.toFixed(1)}% conversion
            </div>
            <Progress value={stats.averageResponseRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.totalSuccessful.toLocaleString()} successful
            </div>
            <Progress value={(stats.totalSuccessful / stats.totalLeads) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => setShowNewCampaignModal(true)} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </div>
          
          {/* Enhanced Status Filter Chips */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => setStatusFilter('all')}
            >
              All ({campaigns.length})
            </Badge>
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = campaigns.filter(c => c.status === status).length;
              return (
                <Badge
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => setStatusFilter(status)}
                >
                  {config.label} ({count})
                </Badge>
              );
            })}
          </div>

          {/* Results Summary */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredCampaigns.length} of {campaigns.length} campaigns
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Campaigns Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader field="name" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                    Campaign Name
                  </SortableHeader>
                  <SortableHeader field="status" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                    Status
                  </SortableHeader>
                  <SortableHeader field="totalLeads" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                    Total Leads
                  </SortableHeader>
                  <SortableHeader field="successfulLeads" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                    Successful Leads
                  </SortableHeader>
                  <SortableHeader field="responseRate" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                    Response Rate
                  </SortableHeader>
                  <TableHead>Progress Bar</TableHead>
                  <SortableHeader field="createdDate" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                    Created Date
                  </SortableHeader>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="space-y-4">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto" />
                        <div>
                          <h3 className="text-lg font-semibold">No campaigns found</h3>
                          <p className="text-muted-foreground">
                            {searchQuery || statusFilter !== 'all'
                              ? 'Try adjusting your filters'
                              : 'Get started by creating your first campaign'
                            }
                          </p>
                        </div>
                        <Button onClick={() => setShowNewCampaignModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Campaign
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div 
                          className="cursor-pointer"
                          onClick={() => setSelectedCampaign(campaign)}
                        >
                          <div className="font-medium hover:text-primary transition-colors">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">{campaign.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={campaign.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {campaign.totalLeads.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col">
                          <span className="font-medium">{campaign.successfulLeads.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">
                            {campaign.totalLeads > 0 ? 
                              `${((campaign.successfulLeads / campaign.totalLeads) * 100).toFixed(1)}%` : '0%'
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col">
                          <span className="font-medium">{campaign.responseRate.toFixed(1)}%</span>
                          <span className={`text-xs ${campaign.responseRate >= 25 ? 'text-green-600' : campaign.responseRate >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {campaign.responseRate >= 25 ? 'Good' : campaign.responseRate >= 15 ? 'Average' : 'Low'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-24 space-y-1">
                          <Progress 
                            value={getProgressValue(campaign)} 
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground text-center">
                            {getProgressValue(campaign).toFixed(0)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex flex-col">
                          <span>{formatDate(campaign.createdDate)}</span>
                          <span className="text-xs">Updated: {formatDate(campaign.lastUpdated)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setSelectedCampaign(campaign)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingCampaign(campaign)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Campaign
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {(campaign.status === 'active' || campaign.status === 'paused') && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(campaign.id, campaign.status === 'active' ? 'paused' : 'active')}
                              >
                                {campaign.status === 'active' ? (
                                  <>
                                    <Pause className="mr-2 h-4 w-4" />
                                    Pause Campaign
                                  </>
                                ) : (
                                  <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Resume Campaign
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setDeleteingCampaign(campaign)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Campaign
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details Dialog */}
      {selectedCampaign && (
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>{selectedCampaign.name}</span>
                <StatusBadge status={selectedCampaign.status} />
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Campaign Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="text-sm mt-1">{selectedCampaign.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created Date</Label>
                      <p className="text-sm mt-1">{formatDate(selectedCampaign.createdDate)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                      <p className="text-sm mt-1">{formatDate(selectedCampaign.lastUpdated)}</p>
                    </div>
                  </div>
                  {selectedCampaign.budget && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Budget</Label>
                        <p className="text-sm mt-1 font-medium">${selectedCampaign.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Spent</Label>
                        <p className="text-sm mt-1 font-medium">${(selectedCampaign.spent || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{selectedCampaign.totalLeads}</div>
                        <p className="text-xs text-muted-foreground">Total Leads</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{selectedCampaign.successfulLeads}</div>
                        <p className="text-xs text-muted-foreground">Successful</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{selectedCampaign.responseRate.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground mb-2">Response Rate</p>
                      <Progress 
                        value={selectedCampaign.responseRate} 
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Keep existing dialogs... */}
      {/* ... rest of existing code remains the same ... */}
    </div>
  );
}