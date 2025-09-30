
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// Project type
interface Project {
  id: string;
  name: string;
  client: string;
  category: "Maintenance" | "Development" | "Social" | "Performance";
  status: "inprogress" | "billed" | "awaitingPO" | "awaitingPayment" | "overdue";
  type: "retainer" | "fixed";
  value: number;
  startDate: string;
  endDate?: string;
  team: string[];
}

// Mock data
const projectsData: Project[] = [
  {
    id: "p1",
    name: "E-commerce Website Redesign",
    client: "ABC Retail",
    category: "Development",
    status: "inprogress",
    type: "fixed",
    value: 850000,
    startDate: "2025-03-15",
    endDate: "2025-06-30",
    team: ["Raj Kumar", "Priya Singh", "Amit Sharma"]
  },
  {
    id: "p2",
    name: "Monthly Website Maintenance",
    client: "XYZ Corp",
    category: "Maintenance",
    status: "billed",
    type: "retainer",
    value: 45000,
    startDate: "2025-04-01",
    team: ["Neha Patel"]
  },
  {
    id: "p3",
    name: "Social Media Campaign",
    client: "LMN Brands",
    category: "Social",
    status: "awaitingPO",
    type: "fixed",
    value: 320000,
    startDate: "2025-04-10",
    endDate: "2025-05-10",
    team: ["Vikram Reddy", "Sneha Jain"]
  },
  {
    id: "p4",
    name: "SEO Optimization",
    client: "PQR Solutions",
    category: "Performance",
    status: "awaitingPayment",
    type: "retainer",
    value: 35000,
    startDate: "2025-03-01",
    team: ["Karthik Iyer"]
  },
  {
    id: "p5",
    name: "Mobile App Development",
    client: "Global Tech",
    category: "Development",
    status: "overdue",
    type: "fixed",
    value: 1250000,
    startDate: "2025-01-15",
    endDate: "2025-04-15",
    team: ["Raj Kumar", "Deepak Mehta", "Ananya Gupta", "Vishal Shah"]
  }
];

const statusLabels = {
  inprogress: "In Progress",
  billed: "Billed",
  awaitingPO: "Awaiting PO",
  awaitingPayment: "Awaiting Payment",
  overdue: "Overdue"
};

const categoryColors = {
  Maintenance: "bg-green-100 text-green-800 border-green-200",
  Development: "bg-blue-100 text-blue-800 border-blue-200",
  Social: "bg-purple-100 text-purple-800 border-purple-200",
  Performance: "bg-orange-100 text-orange-800 border-orange-200"
};

// Form schema for adding a new project
const projectFormSchema = z.object({
  name: z.string().min(2, { message: "Project name must be at least 2 characters." }),
  client: z.string().min(2, { message: "Client name must be at least 2 characters." }),
  category: z.enum(["Maintenance", "Development", "Social", "Performance"], {
    required_error: "Please select a category."
  }),
  status: z.enum(["inprogress", "billed", "awaitingPO", "awaitingPayment", "overdue"], {
    required_error: "Please select a status."
  }),
  type: z.enum(["retainer", "fixed"], {
    required_error: "Please select a project type."
  }),
  value: z.coerce.number().positive({ message: "Project value must be a positive number." }),
  startDate: z.string().min(1, { message: "Please select a start date." }),
  endDate: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [openNewProjectDialog, setOpenNewProjectDialog] = useState(false);
  const { toast } = useToast();
  
  // React Hook Form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      client: "",
      category: "Development",
      status: "inprogress",
      type: "fixed",
      value: 0,
      startDate: new Date().toISOString().split("T")[0],
    },
  });
  
  // Filter projects based on search and filters
  const filteredProjects = projectsData.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || project.category === categoryFilter;
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesType = !typeFilter || project.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesType;
  });

  // Format currency as Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle form submission for adding a new project
  function onSubmit(data: ProjectFormValues) {
    // In a real application, we would add the project to the database
    // For now, we'll just show a success toast
    toast({
      title: "Project created",
      description: `${data.name} has been added to your projects.`,
    });

    // Close the dialog
    setOpenNewProjectDialog(false);

    // Reset form
    form.reset();
  }

  return (
    <DashboardLayout title="Projects">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects or clients..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </Button>
            <Dialog open={openNewProjectDialog} onOpenChange={setOpenNewProjectDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create a new project.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                              <Input placeholder="E-commerce Website Redesign" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="client"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client</FormLabel>
                            <FormControl>
                              <Input placeholder="ABC Company" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Development">Development</SelectItem>
                                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                                  <SelectItem value="Social">Social</SelectItem>
                                  <SelectItem value="Performance">Performance</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="inprogress">In Progress</SelectItem>
                                  <SelectItem value="billed">Billed</SelectItem>
                                  <SelectItem value="awaitingPO">Awaiting PO</SelectItem>
                                  <SelectItem value="awaitingPayment">Awaiting Payment</SelectItem>
                                  <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Type</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select project type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fixed">Fixed Bid</SelectItem>
                                  <SelectItem value="retainer">Retainer</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Value (INR)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="1000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date (Optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormDescription>
                              Leave blank for ongoing projects
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenNewProjectDialog(false)} type="button">
                        Cancel
                      </Button>
                      <Button type="submit">Create Project</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value={undefined}>All Categories</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Performance">Performance</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value={undefined}>All Statuses</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="billed">Billed</SelectItem>
                <SelectItem value="awaitingPO">Awaiting PO</SelectItem>
                <SelectItem value="awaitingPayment">Awaiting Payment</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Project Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Project Type</SelectLabel>
                <SelectItem value={undefined}>All Types</SelectItem>
                <SelectItem value="retainer">Retainer</SelectItem>
                <SelectItem value="fixed">Fixed Bid</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
                <CardDescription>
                  Showing {filteredProjects.length} of {projectsData.length} projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted">
                      <tr>
                        <th scope="col" className="px-4 py-3">Project</th>
                        <th scope="col" className="px-4 py-3">Client</th>
                        <th scope="col" className="px-4 py-3">Category</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                        <th scope="col" className="px-4 py-3">Type</th>
                        <th scope="col" className="px-4 py-3">Value</th>
                        <th scope="col" className="px-4 py-3">Start Date</th>
                        <th scope="col" className="px-4 py-3">Team</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
                          <tr key={project.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 font-medium">
                              <div className="flex items-center">
                                <FileSearch className="h-4 w-4 mr-2" />
                                {project.name}
                              </div>
                            </td>
                            <td className="px-4 py-3">{project.client}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={cn("border", categoryColors[project.category])}>
                                {project.category}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`status-badge status-${project.status}`}>
                                {statusLabels[project.status]}
                              </span>
                            </td>
                            <td className="px-4 py-3 capitalize">{project.type}</td>
                            <td className="px-4 py-3">{formatCurrency(project.value)}</td>
                            <td className="px-4 py-3">{new Date(project.startDate).toLocaleDateString('en-IN')}</td>
                            <td className="px-4 py-3">
                              <div className="flex -space-x-2">
                                {project.team.slice(0, 3).map((member, i) => (
                                  <div key={i} className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                                    {member.charAt(0)}
                                  </div>
                                ))}
                                {project.team.length > 3 && (
                                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                    +{project.team.length - 3}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-4 py-5 text-center text-muted-foreground">
                            No projects found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>In progress projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Switch to the "All Projects" tab and filter by status to see active projects.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Projects</CardTitle>
                <CardDescription>Finished projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Switch to the "All Projects" tab and filter by status to see completed projects.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="overdue">
            <Card>
              <CardHeader>
                <CardTitle>Overdue Projects</CardTitle>
                <CardDescription>Projects past their deadline</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Switch to the "All Projects" tab and filter by status to see overdue projects.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Projects;

