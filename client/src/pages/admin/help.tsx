import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AdminPortalLayout } from "@/components/layout/admin-portal-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { HelpCircle, Search, Send, FileText, BookOpen, Phone, Mail, MessageSquare } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Support ticket schema
const supportTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  priority: z.enum(["low", "medium", "high"]),
  type: z.enum(["general", "technical", "billing", "feature"]),
});

type SupportTicketValues = z.infer<typeof supportTicketSchema>;

export default function AdminHelp() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("faq");
  
  // Support ticket form
  const form = useForm<SupportTicketValues>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      subject: "",
      message: "",
      priority: "medium",
      type: "general",
    },
  });
  
  // Submit support ticket mutation
  const submitTicketMutation = useMutation({
    mutationFn: async (data: SupportTicketValues) => {
      const res = await apiRequest("POST", "/api/admin/support/ticket", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Support ticket submitted",
        description: "We will get back to you as soon as possible.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit ticket",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  // Handle support ticket submission
  const onSubmit = (data: SupportTicketValues) => {
    submitTicketMutation.mutate(data);
  };
  
  // Filter FAQ items based on search query
  const filterFaqItems = (items: { question: string; answer: string }[]) => {
    if (!searchQuery) return items;
    
    return items.filter((item) => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  // FAQ data
  const generalFaqItems = [
    {
      question: "What is Nasi Go?",
      answer: "Nasi Go is a food delivery platform tailored specifically for Papua, Indonesia. It connects local restaurants with customers and provides a seamless delivery experience through our driver network.",
    },
    {
      question: "How do I add a new restaurant to the platform?",
      answer: "To add a new restaurant, go to the Restaurants section in the admin portal and click on the 'Add Restaurant' button. Fill in the required details such as name, address, contact information, and cuisine categories.",
    },
    {
      question: "How can I onboard new drivers?",
      answer: "New drivers can be added through the Drivers section. They need to complete the registration process, provide necessary documentation (ID, license, vehicle information), and undergo a brief orientation before they can start accepting delivery requests.",
    },
    {
      question: "How is the delivery fee calculated?",
      answer: "The delivery fee is calculated based on a base fee plus a per-kilometer rate. You can adjust these rates in the Settings > Payment section of the admin portal.",
    },
    {
      question: "Can I offer promotions or discounts?",
      answer: "Yes, you can create various promotions such as percentage discounts, free delivery, or special offers for specific restaurants or menu items. These can be managed in the Marketing section.",
    },
  ];
  
  const technicalFaqItems = [
    {
      question: "How do I change the platform's logo and branding?",
      answer: "You can update the platform's logo, colors, and branding elements in the Settings > General section. Upload new logo files and adjust the color scheme as needed.",
    },
    {
      question: "What payment gateways are supported?",
      answer: "Nasi Go currently supports several payment gateways including Midtrans, Xendit, DOKU, and cash on delivery. You can configure these in the Settings > Payment section.",
    },
    {
      question: "How can I monitor system performance?",
      answer: "The Analytics section provides comprehensive insights into system performance, order volumes, delivery times, and other key metrics. You can also export these reports for further analysis.",
    },
    {
      question: "How do I manage user accounts and permissions?",
      answer: "User accounts and permissions can be managed in the Settings > Security section. You can create different admin roles with specific access permissions based on job responsibilities.",
    },
    {
      question: "What should I do if the system is running slow?",
      answer: "If the system is running slow, check for high traffic volumes in Analytics, ensure your database isn't reaching capacity limits, and consider optimizing large data queries. Contact technical support if issues persist.",
    },
  ];
  
  const businessFaqItems = [
    {
      question: "How do restaurant payouts work?",
      answer: "Restaurant payouts are processed on a weekly basis. The platform charges a configurable commission (set in Settings > Payment) on each order, and the remaining amount is transferred to the restaurant's registered bank account.",
    },
    {
      question: "How are driver earnings calculated?",
      answer: "Drivers earn from delivery fees and can receive tips from customers. The delivery fee calculation is based on distance, and drivers keep the majority of this fee minus the platform's service charge.",
    },
    {
      question: "Can I get reports on sales and performance?",
      answer: "Yes, detailed reports on sales, order volumes, restaurant performance, and driver activities are available in the Analytics section. You can filter these reports by date range and export them in various formats.",
    },
    {
      question: "How can I increase customer retention?",
      answer: "Implement loyalty programs, send targeted promotions to inactive users, ensure quality control with restaurants, maintain competitive delivery fees, and collect/act on customer feedback regularly.",
    },
    {
      question: "What marketing tools are available?",
      answer: "The platform offers email campaigns, push notifications, in-app promotions, referral programs, and restaurant highlight features to help market the service to users.",
    },
  ];
  
  return (
    <AdminPortalLayout title="Help & Support">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Help & Support Center</h1>
        <p className="text-neutral-500">
          Find answers to common questions or contact our support team
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="faq" className="flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            Contact Support
          </TabsTrigger>
        </TabsList>
        
        {/* FAQs Tab */}
        <TabsContent value="faq" className="mt-0">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about using the Nasi Go admin portal
              </CardDescription>
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general">
                <TabsList className="mb-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                  <TabsTrigger value="business">Business</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general">
                  <Accordion type="single" collapsible className="w-full">
                    {filterFaqItems(generalFaqItems).map((item, index) => (
                      <AccordionItem key={index} value={`general-item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-neutral-600">{item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                    {filterFaqItems(generalFaqItems).length === 0 && (
                      <p className="text-neutral-500 py-4 text-center">
                        No matching FAQs found. Try a different search term.
                      </p>
                    )}
                  </Accordion>
                </TabsContent>
                
                <TabsContent value="technical">
                  <Accordion type="single" collapsible className="w-full">
                    {filterFaqItems(technicalFaqItems).map((item, index) => (
                      <AccordionItem key={index} value={`technical-item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-neutral-600">{item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                    {filterFaqItems(technicalFaqItems).length === 0 && (
                      <p className="text-neutral-500 py-4 text-center">
                        No matching FAQs found. Try a different search term.
                      </p>
                    )}
                  </Accordion>
                </TabsContent>
                
                <TabsContent value="business">
                  <Accordion type="single" collapsible className="w-full">
                    {filterFaqItems(businessFaqItems).map((item, index) => (
                      <AccordionItem key={index} value={`business-item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-neutral-600">{item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                    {filterFaqItems(businessFaqItems).length === 0 && (
                      <p className="text-neutral-500 py-4 text-center">
                        No matching FAQs found. Try a different search term.
                      </p>
                    )}
                  </Accordion>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <p className="text-neutral-500 text-sm">
                Can't find what you're looking for? 
                <Button 
                  variant="link" 
                  className="px-1.5 h-auto"
                  onClick={() => setActiveTab("contact")}
                >
                  Contact our support team
                </Button>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Documentation Tab */}
        <TabsContent value="documentation" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <div className="bg-primary bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                  <BookOpen className="text-primary h-6 w-6" />
                </div>
                <CardTitle>Admin Portal Guide</CardTitle>
                <CardDescription>
                  Learn how to use the admin portal effectively
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">
                  Comprehensive guide covering all aspects of the admin portal, including user management, order processing, restaurant management, and analytics.
                </p>
                <Button variant="outline" className="w-full">
                  View Guide
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="bg-secondary bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="text-secondary h-6 w-6" />
                </div>
                <CardTitle>Restaurant Management</CardTitle>
                <CardDescription>
                  Tips for managing restaurants effectively
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">
                  Learn how to onboard new restaurants, manage menus, handle special requests, and optimize restaurant performance on the platform.
                </p>
                <Button variant="outline" className="w-full">
                  View Guide
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="bg-accent bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                  <MessageSquare className="text-accent h-6 w-6" />
                </div>
                <CardTitle>Driver Management</CardTitle>
                <CardDescription>
                  Best practices for driver operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">
                  Comprehensive guide for managing drivers, including onboarding, scheduling, performance monitoring, payment processing, and dispute resolution.
                </p>
                <Button variant="outline" className="w-full">
                  View Guide
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>
                  Step-by-step video guides for common tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { title: "Getting Started with Nasi Go Admin", duration: "5:21" },
                    { title: "Managing Restaurant Menus", duration: "7:45" },
                    { title: "Processing and Tracking Orders", duration: "6:12" },
                    { title: "Driver Assignment and Monitoring", duration: "8:33" },
                    { title: "Analytics and Reporting", duration: "10:17" },
                  ].map((video, index) => (
                    <li key={index} className="flex justify-between items-center border-b pb-2">
                      <div className="flex items-center">
                        <div className="bg-neutral-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          <span className="text-primary text-xs">{index + 1}</span>
                        </div>
                        <span>{video.title}</span>
                      </div>
                      <span className="text-sm text-neutral-500">{video.duration}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Tutorials
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  Developer resources for API integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-neutral-600">
                    Comprehensive documentation for integrating with the Nasi Go API, including authentication, endpoints, request/response formats, and examples.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full">
                      REST API Docs
                    </Button>
                    <Button variant="outline" className="w-full">
                      SDK Documentation
                    </Button>
                    <Button variant="outline" className="w-full">
                      Webhooks Guide
                    </Button>
                    <Button variant="outline" className="w-full">
                      Code Examples
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-neutral-500">
                  API access requires developer credentials. Contact support for access.
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Contact Support Tab */}
        <TabsContent value="contact" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <div className="bg-primary bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                  <Mail className="text-primary h-6 w-6" />
                </div>
                <CardTitle>Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">
                  Send us an email and we'll get back to you within 24 hours on business days.
                </p>
                <p className="font-medium">support@nasigo.com</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="bg-secondary bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                  <Phone className="text-secondary h-6 w-6" />
                </div>
                <CardTitle>Phone Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">
                  Available Monday to Friday, 9:00 AM to 5:00 PM (Papua Time).
                </p>
                <p className="font-medium">+62 1234 5678 90</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="bg-accent bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                  <MessageSquare className="text-accent h-6 w-6" />
                </div>
                <CardTitle>Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">
                  Connect with a support representative in real-time during business hours.
                </p>
                <Button className="w-full">Start Chat</Button>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Ticket</CardTitle>
              <CardDescription>
                Fill out the form below and our team will get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form 
                  id="support-form" 
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the subject of your inquiry" {...field} />
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
                          <FormLabel>Inquiry Type*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select inquiry type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General Question</SelectItem>
                              <SelectItem value="technical">Technical Issue</SelectItem>
                              <SelectItem value="billing">Billing/Payments</SelectItem>
                              <SelectItem value="feature">Feature Request</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your issue or question in detail"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include relevant details to help us assist you better
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low - General question</SelectItem>
                            <SelectItem value="medium">Medium - Minor issue</SelectItem>
                            <SelectItem value="high">High - Urgent problem</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Set priority based on the urgency of your request
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button
                variant="outline"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="support-form"
                disabled={submitTicketMutation.isPending}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {submitTicketMutation.isPending ? "Submitting..." : "Submit Ticket"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPortalLayout>
  );
}