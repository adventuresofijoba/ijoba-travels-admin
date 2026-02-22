"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { Inquiry } from "@/types";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  User,
  Calendar,
  MessageSquare,
  Eye,
} from "lucide-react";

export default function FormsPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load inquiries");
      console.error(error);
    } else {
      setInquiries(data || []);
    }
    setLoading(false);
  };

  const handleViewDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] gap-5 px-5 py-5 sm:py-10 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Forms</h1>
      </div>

      <div className="rounded-md border border-black/10 h-max">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No inquiries found.
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inq) => (
                <TableRow key={inq.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(inq.created_at), "MMM d, yyyy")}
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(inq.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {inq.full_name}
                    {inq.phone_number && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {inq.phone_number}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{inq.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inq.inquiry_type === "custom_package"
                          ? "default"
                          : inq.inquiry_type === "package_reserve"
                          ? "outline"
                          : "secondary"
                      }
                      className="whitespace-nowrap"
                    >
                      {inq.inquiry_type === "custom_package"
                        ? "Custom Trip"
                        : inq.inquiry_type === "package_reserve"
                        ? "Package Reserve"
                        : inq.inquiry_type === "newsletter"
                        ? "Newsletter"
                        : "Contact"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(inq)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center justify-between mr-8">
              <DialogTitle className="text-xl">Inquiry Details</DialogTitle>
              <Badge
                variant={
                  selectedInquiry?.inquiry_type === "custom_package"
                    ? "default"
                    : selectedInquiry?.inquiry_type === "package_reserve"
                    ? "outline"
                    : "secondary"
                }
              >
                {selectedInquiry?.inquiry_type === "custom_package"
                  ? "Custom Trip"
                  : selectedInquiry?.inquiry_type === "package_reserve"
                  ? "Package Reserve"
                  : selectedInquiry?.inquiry_type === "newsletter"
                  ? "Newsletter"
                  : "Contact"}
              </Badge>
            </div>
            <DialogDescription>
              Submitted{" "}
              {selectedInquiry &&
                formatDistanceToNow(new Date(selectedInquiry.created_at), {
                  addSuffix: true,
                })}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 pt-2">
            {selectedInquiry && (
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" /> Client Name
                    </h4>
                    <p className="font-medium">{selectedInquiry.full_name}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </h4>
                    <p className="font-medium">{selectedInquiry.email}</p>
                  </div>
                  {selectedInquiry.phone_number && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" /> Phone
                      </h4>
                      <p className="font-medium">
                        {selectedInquiry.phone_number}
                      </p>
                    </div>
                  )}
                </div>

                {selectedInquiry.inquiry_type === "custom_package" && (
                  <div className="rounded-lg border p-4 bg-muted/30 grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Destination
                      </h4>
                      <p className="font-medium">
                        {selectedInquiry.preferred_destination}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Briefcase className="h-4 w-4" /> Travel Style
                      </h4>
                      <p className="font-medium">
                        {selectedInquiry.travel_style}
                      </p>
                    </div>
                    {selectedInquiry.travel_dates && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> Dates
                        </h4>
                        <p className="font-medium">
                          {selectedInquiry.travel_dates}
                        </p>
                      </div>
                    )}
                    {selectedInquiry.budget_range && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <span className="font-bold text-xs">₦</span> Budget
                        </h4>
                        <p className="font-medium">
                          {selectedInquiry.budget_range}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedInquiry.inquiry_type === "package_reserve" && (
                  <div className="rounded-lg border p-4 bg-muted/30">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Briefcase className="h-4 w-4" /> Package
                      </h4>
                      <p className="font-medium">
                        {selectedInquiry.preferred_destination}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Message
                  </h4>
                  <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap">
                    {selectedInquiry.message || "No message provided"}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="p-6 pt-2 border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
