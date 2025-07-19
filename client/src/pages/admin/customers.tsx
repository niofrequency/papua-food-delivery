import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPortalLayout } from "@/components/layout/admin-portal-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Eye, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomersAdmin() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const itemsPerPage = 10;

  // Fetch customers with filters, pagination, etc.
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["/api/admin/customers", searchQuery, roleFilter, sortBy, currentPage],
    queryFn: async () => {
      let url = "/api/admin/customers?";
      
      if (searchQuery) {
        url += `search=${encodeURIComponent(searchQuery)}&`;
      }
      
      if (roleFilter !== "all") {
        url += `role=${roleFilter}&`;
      }
      
      url += `sortBy=${sortBy}&page=${currentPage}&limit=${itemsPerPage}`;
      
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({
          title: "Error loading customers",
          description: "Failed to load customer data. Please try again later.",
          variant: "destructive",
        });
        return { customers: [], totalPages: 1 };
      }
    },
  });

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const formData = new FormData(e.target as HTMLFormElement);
    setSearchQuery(formData.get("searchQuery") as string);
  };

  // Total pages calculation
  const totalPages = customers?.totalPages || 1;

  // View customer details
  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminPortalLayout title="Customers">
      {/* Actions & Filters */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                    <Input
                      name="searchQuery"
                      placeholder="Search by name, email, phone..."
                      className="pl-10"
                      defaultValue={searchQuery}
                    />
                  </div>
                  <Button type="submit">Search</Button>
                </form>
              </div>
              <div className="flex gap-2">
                <div>
                  <Select
                    value={roleFilter}
                    onValueChange={(value) => {
                      setRoleFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        <span>Filter by Role</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="customer">Customers</SelectItem>
                      <SelectItem value="driver">Drivers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => {
                      setSortBy(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        <span>Sort By</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="nameDesc">Name (Z-A)</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="ordersDesc">Most Orders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="mb-6">
        <CardHeader className="pb-1">
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email/Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingCustomers ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : customers?.customers && customers.customers.length > 0 ? (
                  customers.customers.map((customer: any) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>{customer.fullName?.charAt(0) || "U"}</AvatarFallback>
                            {customer.avatar && <AvatarImage src={customer.avatar} />}
                          </Avatar>
                          <div>
                            <p className="font-medium">{customer.fullName}</p>
                            <p className="text-xs text-neutral-500">@{customer.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{customer.email}</p>
                          {customer.phone && (
                            <p className="text-xs text-neutral-500">{customer.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={customer.role === "driver" ? "secondary" : "default"}
                          className="capitalize"
                        >
                          {customer.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customer.createdAt && formatDate(customer.createdAt)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{customer.orderCount || 0}</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={customer.isActive ? "default" : "outline"}
                        >
                          {customer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-primary"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      {searchQuery ? (
                        <div>
                          <p className="text-neutral-500">No customers found matching "{searchQuery}"</p>
                          <Button
                            variant="link"
                            onClick={() => setSearchQuery("")}
                            className="mt-2"
                          >
                            Clear search
                          </Button>
                        </div>
                      ) : (
                        <p className="text-neutral-500">No customers found</p>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {customers?.customers && customers.customers.length > 0 && (
            <div className="flex items-center justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <div className="text-sm text-neutral-600">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog
        open={selectedCustomer !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedCustomer(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Detailed information about the customer.
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="grid gap-6 mt-4">
              {/* Customer Profile */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{selectedCustomer.fullName?.charAt(0) || "U"}</AvatarFallback>
                  {selectedCustomer.avatar && <AvatarImage src={selectedCustomer.avatar} />}
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedCustomer.fullName}</h3>
                  <p className="text-neutral-500">{selectedCustomer.email}</p>
                  {selectedCustomer.phone && (
                    <p className="text-neutral-500">{selectedCustomer.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-1">
                      <p className="text-sm text-neutral-500">Username:</p>
                      <p className="text-sm">{selectedCustomer.username}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <p className="text-sm text-neutral-500">Role:</p>
                      <p className="text-sm capitalize">{selectedCustomer.role}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <p className="text-sm text-neutral-500">Joined Date:</p>
                      <p className="text-sm">
                        {selectedCustomer.createdAt && formatDate(selectedCustomer.createdAt)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <p className="text-sm text-neutral-500">Status:</p>
                      <p className="text-sm">{selectedCustomer.isActive ? "Active" : "Inactive"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Address Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedCustomer.address ? (
                      <>
                        <p className="text-sm">{selectedCustomer.address}</p>
                      </>
                    ) : (
                      <p className="text-sm text-neutral-500">No address information provided</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Statistics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Order Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-neutral-50 p-3 rounded">
                      <p className="text-sm text-neutral-500">Total Orders</p>
                      <p className="text-xl font-bold">{selectedCustomer.orderCount || 0}</p>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded">
                      <p className="text-sm text-neutral-500">Last Order</p>
                      <p className="text-xl font-bold">
                        {selectedCustomer.lastOrderDate
                          ? formatDate(selectedCustomer.lastOrderDate)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded">
                      <p className="text-sm text-neutral-500">Avg. Order Value</p>
                      <p className="text-xl font-bold">
                        {selectedCustomer.avgOrderValue
                          ? `Rp ${parseInt(selectedCustomer.avgOrderValue).toLocaleString()}`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded">
                      <p className="text-sm text-neutral-500">Total Spend</p>
                      <p className="text-xl font-bold">
                        {selectedCustomer.totalSpend
                          ? `Rp ${parseInt(selectedCustomer.totalSpend).toLocaleString()}`
                          : "Rp 0"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPortalLayout>
  );
}