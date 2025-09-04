"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { create } from 'zustand';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  User,
  Building2,
  Tag,
  Clock,
  Edit3,
  Loader2,
  AlertCircle,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Types
interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  campaign: string;
  status: 'pending' | 'contacted' | 'responded' | 'converted';
  lastContact: string;
  avatar?: string;
  phone?: string;
  interactions: Interaction[];
}

interface Interaction {
  id: string;
  type: 'email' | 'call' | 'note' | 'meeting';
  content: string;
  timestamp: string;
  author: string;
}

interface LeadsState {
  selectedLeadId: string | null;
  sheetOpen: boolean;
  searchQuery: string;
  campaignFilter: string;
  statusFilters: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  dateRange: { from: string; to: string } | null;
  setSelectedLead: (id: string | null) => void;
  setSheetOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCampaignFilter: (campaign: string) => void;
  setStatusFilters: (statuses: string[]) => void;
  setSortBy: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setDateRange: (range: { from: string; to: string } | null) => void;
}

// Zustand Store
const useLeadsStore = create<LeadsState>((set) => ({
  selectedLeadId: null,
  sheetOpen: false,
  searchQuery: '',
  campaignFilter: 'all',
  statusFilters: [],
  sortBy: 'name',
  sortOrder: 'asc',
  dateRange: null,
  setSelectedLead: (id) => set({ selectedLeadId: id }),
  setSheetOpen: (open) => set({ sheetOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCampaignFilter: (campaign) => set({ campaignFilter: campaign }),
  setStatusFilters: (statuses) => set({ statusFilters: statuses }),
  setSortBy: (field) => set({ sortBy: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setDateRange: (range) => set({ dateRange: range }),
}));

// Mock API functions
const fetchLeads = async ({ pageParam = 0, searchQuery = '', campaignFilter = 'all', statusFilters = [], sortBy = 'name', sortOrder = 'asc' }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const mockLeads: Lead[] = Array.from({ length: 20 }, (_, i) => ({
    id: `lead-${pageParam * 20 + i + 1}`,
    name: `Lead ${pageParam * 20 + i + 1}`,
    email: `lead${pageParam * 20 + i + 1}@example.com`,
    company: `Company ${(pageParam * 20 + i) % 10 + 1}`,
    campaign: `Campaign ${(pageParam * 20 + i) % 5 + 1}`,
    status: ['pending', 'contacted', 'responded', 'converted'][i % 4] as Lead['status'],
    lastContact: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    avatar: `https://images.unsplash.com/photo-${1500000000000 + i}?w=100&h=100&fit=crop&crop=face`,
    phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    interactions: [],
  }));

  return {
    leads: mockLeads,
    nextCursor: pageParam < 10 ? pageParam + 1 : undefined,
    hasMore: pageParam < 10,
    total: 200,
  };
};

const fetchLeadDetail = async (leadId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    id: leadId,
    name: `Lead Name`,
    email: `lead@example.com`,
    company: `Tech Company Inc.`,
    campaign: `Summer Campaign`,
    status: 'responded' as Lead['status'],
    lastContact: new Date().toISOString(),
    phone: `+1 (555) 123-4567`,
    interactions: [
      {
        id: '1',
        type: 'email' as const,
        content: 'Initial outreach email sent',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        author: 'John Doe',
      },
      {
        id: '2',
        type: 'call' as const,
        content: 'Follow-up call - interested in our services',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        author: 'Jane Smith',
      },
    ],
  };
};

// Status configuration with updated modern colors
const statusConfig = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700 border-slate-200', dotColor: 'bg-slate-400' },
  contacted: { label: 'Contacted', color: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
  responded: { label: 'Responded', color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
  converted: { label: 'Converted', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
};

// Status Badge Component with modern styling
const StatusBadge: React.FC<{ status: Lead['status'] }> = ({ status }) => {
  const config = statusConfig[status];
  
  if (!config) {
    return (
      <Badge variant="secondary" className="bg-slate-100 text-slate-700 border border-slate-200 font-medium px-2.5 py-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
        Unknown
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className={`${config.color} border font-medium px-2.5 py-0.5`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor} mr-1.5`} />
      {config.label}
    </Badge>
  );
};

// Table Header Component
const SortableHeader: React.FC<{ field: string; children: React.ReactNode }> = ({ field, children }) => {
  const { sortBy, sortOrder, setSortBy, setSortOrder } = useLeadsStore();

  const handleSort = useCallback(() => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [field, sortBy, sortOrder, setSortBy, setSortOrder]);

  const getSortIcon = () => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 text-gray-600" /> : <ArrowDown className="w-4 h-4 text-gray-600" />;
  };

  return (
    <TableHead className="cursor-pointer hover:bg-gray-50 transition-colors font-medium text-gray-700" onClick={handleSort}>
      <div className="flex items-center space-x-2">
        <span>{children}</span>
        {getSortIcon()}
      </div>
    </TableHead>
  );
};

// Lead Row Component
const LeadRow: React.FC<{ lead: Lead }> = React.memo(({ lead }) => {
  const { setSelectedLead, setSheetOpen } = useLeadsStore();

  const handleRowClick = useCallback(() => {
    setSelectedLead(lead.id);
    setSheetOpen(true);
  }, [lead.id, setSelectedLead, setSheetOpen]);

  return (
    <TableRow className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100" onClick={handleRowClick}>
      <TableCell className="font-medium py-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9 border border-gray-200">
            <AvatarImage src={lead.avatar} alt={lead.name} />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
              {lead.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="text-gray-900 font-medium">{lead.name}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-gray-600">{lead.email}</TableCell>
      <TableCell className="text-gray-600">{lead.company}</TableCell>
      <TableCell className="text-gray-600">{lead.campaign}</TableCell>
      <TableCell>
        <StatusBadge status={lead.status} />
      </TableCell>
      <TableCell className="text-gray-500">
        {new Date(lead.lastContact).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
});

// Mobile Lead Card Component
const LeadCard: React.FC<{ lead: Lead }> = React.memo(({ lead }) => {
  const { setSelectedLead, setSheetOpen } = useLeadsStore();

  const handleCardClick = useCallback(() => {
    setSelectedLead(lead.id);
    setSheetOpen(true);
  }, [lead.id, setSelectedLead, setSheetOpen]);

  return (
    <Card className="cursor-pointer hover:shadow-md transition-all border border-gray-200 bg-white" onClick={handleCardClick}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10 border border-gray-200">
            <AvatarImage src={lead.avatar} alt={lead.name} />
            <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
              {lead.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate text-gray-900">{lead.name}</h4>
            <p className="text-sm text-gray-500 truncate">{lead.email}</p>
          </div>
          <StatusBadge status={lead.status} />
        </div>
        <div className="space-y-1 text-sm text-gray-500">
          <div className="flex items-center">
            <Building2 className="w-4 h-4 mr-2" />
            {lead.company}
          </div>
          <div className="flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            {lead.campaign}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            {new Date(lead.lastContact).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Lead Detail Sheet Component
const LeadDetailSheet: React.FC = () => {
  const { selectedLeadId, sheetOpen, setSheetOpen } = useLeadsStore();
  const queryClient = useQueryClient();

  const { data: leadDetail, isLoading } = useQuery({
    queryKey: ['lead-detail', selectedLeadId],
    queryFn: () => selectedLeadId ? fetchLeadDetail(selectedLeadId) : null,
    enabled: !!selectedLeadId && sheetOpen,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: Lead['status'] }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { leadId, status };
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ leadId, note }: { leadId: string; note: string }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { leadId, note };
    },
    onSuccess: () => {
      toast.success('Note added successfully');
      queryClient.invalidateQueries({ queryKey: ['lead-detail', selectedLeadId] });
    },
    onError: () => {
      toast.error('Failed to add note');
    },
  });

  const [newNote, setNewNote] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);

  const handleStatusChange = useCallback((status: Lead['status']) => {
    if (selectedLeadId) {
      updateStatusMutation.mutate({ leadId: selectedLeadId, status });
    }
  }, [selectedLeadId, updateStatusMutation]);

  const handleAddNote = useCallback(() => {
    if (selectedLeadId && newNote.trim()) {
      addNoteMutation.mutate({ leadId: selectedLeadId, note: newNote });
      setNewNote('');
    }
  }, [selectedLeadId, newNote, addNoteMutation]);

  const getInteractionIcon = (type: Interaction['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'note':
        return <MessageSquare className="w-4 h-4" />;
      case 'meeting':
        return <Calendar className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:w-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[200px]" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ) : leadDetail ? (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle>Lead Details</SheetTitle>
                <SheetDescription>
                  Manage lead information and interactions
                </SheetDescription>
              </SheetHeader>

              {/* Lead Info */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={leadDetail.avatar} alt={leadDetail.name} />
                      <AvatarFallback className="text-lg">
                        {leadDetail.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{leadDetail.name}</h3>
                      <p className="text-muted-foreground">{leadDetail.company}</p>
                      <StatusBadge status={leadDetail.status} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{leadDetail.email}</span>
                    </div>
                    {leadDetail.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{leadDetail.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span>{leadDetail.campaign}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setComposeOpen(true)}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                    <Select onValueChange={(value) => handleStatusChange(value as Lead['status'])}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="responded">Responded</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Interaction History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  {leadDetail.interactions?.length > 0 ? (
                    <div className="space-y-4">
                      {leadDetail.interactions.map((interaction) => (
                        <div key={interaction.id} className="flex space-x-3 p-3 rounded-lg bg-muted/50">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center">
                            {getInteractionIcon(interaction.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{interaction.author}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(interaction.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {interaction.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No interactions recorded yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Add Note */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || addNoteMutation.isPending}
                    className="w-full"
                  >
                    {addNoteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Edit3 className="w-4 h-4 mr-2" />
                    )}
                    Add Note
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Compose Modal */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">To:</label>
              <Input value={leadDetail?.email || ''} disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Subject:</label>
              <Input placeholder="Enter subject..." />
            </div>
            <div>
              <label className="text-sm font-medium">Message:</label>
              <Textarea placeholder="Enter your message..." rows={6} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setComposeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => { setComposeOpen(false); toast.success('Email sent!'); }}>
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Main LeadsManager Component
const LeadsManager: React.FC = () => {
  const {
    searchQuery,
    campaignFilter,
    statusFilters,
    sortBy,
    sortOrder,
    setSearchQuery,
    setCampaignFilter,
    setStatusFilters,
  } = useLeadsStore();

  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['leads', searchQuery, campaignFilter, statusFilters, sortBy, sortOrder],
    queryFn: ({ pageParam }) =>
      fetchLeads({
        pageParam,
        searchQuery,
        campaignFilter,
        statusFilters,
        sortBy,
        sortOrder,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });

  const allLeads = useMemo(() => {
    return data?.pages.flatMap((page) => page.leads) ?? [];
  }, [data]);

  const totalLeads = data?.pages[0]?.total ?? 0;

  // Status filter management
  const toggleStatusFilter = useCallback((status: string) => {
    const newFilters = statusFilters.includes(status)
      ? statusFilters.filter(s => s !== status)
      : [...statusFilters, status];
    setStatusFilters(newFilters);
  }, [statusFilters, setStatusFilters]);

  // Infinite scroll detection with improved logic
  useEffect(() => {
    const handleScroll = () => {
      if (
        hasNextPage &&
        !isFetchingNextPage &&
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500 // Trigger earlier
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isError) {
    return (
      <Card className="p-8 bg-white shadow-sm border border-red-100">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900">Error Loading Leads</h3>
          <p className="text-gray-600">
            There was an error loading your leads. Please try again.
          </p>
          <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Toolbar */}
      <Card className="bg-white shadow-sm border-0 shadow-slate-100">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger className="w-full sm:w-[180px] border-slate-200">
                  <Filter className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  <SelectItem value="campaign1">Campaign 1</SelectItem>
                  <SelectItem value="campaign2">Campaign 2</SelectItem>
                  <SelectItem value="campaign3">Campaign 3</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start border-slate-200 text-slate-700">
                    <Filter className="w-4 h-4 mr-2" />
                    Status {statusFilters.length > 0 && `(${statusFilters.length})`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="start">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none text-slate-900">Filter by Status</h4>
                    <Separator />
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <div key={status} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={status}
                          checked={statusFilters.includes(status)}
                          onChange={() => toggleStatusFilter(status)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={status} className="text-sm cursor-pointer text-slate-700">
                          {config.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-slate-200 text-slate-700">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm" className="border-slate-200 text-slate-700">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Lead
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {allLeads.length} of {totalLeads} leads
          </p>
        </div>
      )}

      {/* Desktop Table */}
      <Card className="hidden md:block bg-white shadow-sm border-0 shadow-slate-100">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200">
              <SortableHeader field="name">Lead</SortableHeader>
              <SortableHeader field="email">Email</SortableHeader>
              <SortableHeader field="company">Company</SortableHeader>
              <SortableHeader field="campaign">Campaign</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="lastContact">Last Contact</SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-slate-100">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-[120px]" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
              ))
            ) : allLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="space-y-4">
                    <Users className="w-12 h-12 text-slate-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">No leads found</h3>
                      <p className="text-slate-600">
                        {searchQuery || statusFilters.length > 0 || campaignFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Get started by adding your first lead'
                        }
                      </p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lead
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              allLeads.map((lead) => <LeadRow key={lead.id} lead={lead} />)
            )}
          </TableBody>
        </Table>

        {/* Infinite scroll loading indicator - no more load more button */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-6 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading more leads...</span>
            </div>
          </div>
        )}
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-white shadow-sm border-0 shadow-slate-100">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[180px]" />
                  </div>
                  <Skeleton className="h-6 w-[80px]" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-[80%]" />
                  <Skeleton className="h-3 w-[60%]" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : allLeads.length === 0 ? (
          <Card className="p-8 bg-white shadow-sm border-0 shadow-slate-100">
            <div className="text-center space-y-4">
              <Users className="w-12 h-12 text-slate-400 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">No leads found</h3>
                <p className="text-slate-600">
                  {searchQuery || statusFilters.length > 0 || campaignFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first lead'
                  }
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </Card>
        ) : (
          allLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
        )}

        {/* Mobile infinite scroll loading indicator - no more load more button */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-6">
            <div className="flex items-center space-x-2 text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading more leads...</span>
            </div>
          </div>
        )}
      </div>

      {/* Lead Detail Sheet */}
      <LeadDetailSheet />
    </div>
  );
};

export default LeadsManager;