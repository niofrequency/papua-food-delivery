import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPortalLayout } from "@/components/layout/admin-portal-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Driver } from "@shared/schema";
import { useMobile } from "@/hooks/use-mobile";

export default function DriversAdmin() {
  const isMobile = useMobile();
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const { data: driversData, isLoading, error } = useQuery({
    queryKey: ["/api/admin/drivers"],
    retry: false,
  });

  useEffect(() => {
    if (driversData) {
      setDrivers(driversData);
    }
  }, [driversData]);

  return (
    <AdminPortalLayout title="Manage Drivers">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>All Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            ) : error ? (
              <div className="text-destructive text-center">
                Failed to load drivers
              </div>
            ) : drivers.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-muted-foreground">No drivers available</p>
              </div>
            ) : (
              <div className={isMobile ? "overflow-auto" : ""}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>License Plate</TableHead>
                      <TableHead>Vehicle Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {driver.user?.fullName?.substring(0, 2) || "DR"}
                            </AvatarFallback>
                            {driver.user?.profileImage && (
                              <AvatarImage src={driver.user.profileImage} />
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{driver.user?.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {driver.user?.phone || "No phone"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{driver.licensePlate}</TableCell>
                        <TableCell>{driver.vehicleType}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={driver.isAvailable ? "success" : "secondary"}
                          >
                            {driver.isAvailable ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={driver.isActive} 
                            disabled
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPortalLayout>
  );
}