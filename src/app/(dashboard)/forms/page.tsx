"use client";

import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
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
  Clock,
  MoreVertical,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";

export default function FormsPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "resolved" | "unresolved" | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const fetchInquiries = async (page: number, showLoading = true) => {
    if (showLoading) setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase.from("inquiries").select("*", { count: "exact" });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      toast.error("Failed to load inquiries");
      console.error(error);
    } else {
      setInquiries(data || []);
      if (count !== null) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    }
    if (showLoading) setLoading(false);
  };

  const handleStatusChange = async (
    inquiry: Inquiry,
    newStatus: "resolved" | "unresolved"
  ) => {
    const { error } = await supabase
      .from("inquiries")
      .update({ status: newStatus })
      .eq("id", inquiry.id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      fetchInquiries(currentPage, false);
      if (selectedInquiry && selectedInquiry.id === inquiry.id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    }
  };

  const handleViewDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchInquiries(currentPage);
  }, [currentPage, statusFilter]);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-start gap-5 px-5 py-5 sm:py-10 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Forms</h1>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer text-lg ml-auto">
            <Filter size={16} />
            Filter
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border border-black/10 rounded-md bg-[#F5E8C7] z-30 py-1 shadow-md mt-1"
          >
            <div className="flex items-center gap-2 px-2 py-1">
              <input
                type="radio"
                name="formsStatusFilter"
                id="forms-all"
                checked={statusFilter === null}
                onChange={() => {
                  setStatusFilter(null);
                  setCurrentPage(1);
                }}
                className="cursor-pointer w-4 h-4 appearance-none rounded-full border border-black checked:bg-black checked:border-black"
              />
              <label htmlFor="forms-all" className="cursor-pointer">
                All
              </label>
            </div>
            <div className="flex items-center gap-2 px-2 py-1">
              <input
                type="radio"
                name="formsStatusFilter"
                id="forms-resolved"
                checked={statusFilter === "resolved"}
                onChange={() => {
                  setStatusFilter("resolved");
                  setCurrentPage(1);
                }}
                className="cursor-pointer w-4 h-4 appearance-none rounded-full border border-black checked:bg-black checked:border-black"
              />
              <label htmlFor="forms-resolved" className="cursor-pointer">
                Resolved
              </label>
            </div>
            <div className="flex items-center gap-2 px-2 py-1">
              <input
                type="radio"
                name="formsStatusFilter"
                id="forms-unresolved"
                checked={statusFilter === "unresolved"}
                onChange={() => {
                  setStatusFilter("unresolved");
                  setCurrentPage(1);
                }}
                className="cursor-pointer w-4 h-4 appearance-none rounded-full border border-black checked:bg-black checked:border-black"
              />
              <label htmlFor="forms-unresolved" className="cursor-pointer">
                Unresolved
              </label>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="min-h-40 w-full p-5 bg-[#F5E8C7] rounded-md grid gap-5 grid-rows-[auto_1fr_auto]"
            >
              <div className="grid gap-2">
                <Skeleton className="h-6 w-24 bg-black/10" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 bg-black/10" />
                  <Skeleton className="h-5 w-20 bg-black/10" />
                </div>
              </div>
              <div className="grid gap-3">
                <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full bg-black/10" />
                  <div className="grid gap-1">
                    <Skeleton className="h-3 w-16 bg-black/10" />
                    <Skeleton className="h-4 w-32 bg-black/10" />
                  </div>
                </div>
                <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full bg-black/10" />
                  <div className="grid gap-1">
                    <Skeleton className="h-3 w-16 bg-black/10" />
                    <Skeleton className="h-4 w-40 bg-black/10" />
                  </div>
                </div>
                <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full bg-black/10" />
                  <div className="grid gap-1">
                    <Skeleton className="h-3 w-20 bg-black/10" />
                    <Skeleton className="h-4 w-24 bg-black/10" />
                  </div>
                </div>
              </div>
              <div className="grid grid-flow-col items-center justify-between border-t border-black/10 pt-5 mt-auto">
                <Skeleton className="h-4 w-24 bg-black/10" />
                <Skeleton className="h-4 w-24 bg-black/10" />
              </div>
            </div>
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="grid place-content-center min-h-50 text-muted-foreground">
          No inquiries found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="min-h-40 w-full p-5 bg-[#F5E8C7] rounded-md grid gap-5 grid-rows-[auto_1fr_auto] relative"
            >
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-white/50 cursor-pointer hover:bg-white/80"
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-[#F8EFD8] rounded-sm p-2 mt-2 space-y-1 z-10 shadow-lg border border-black/5"
                  >
                    <DropdownMenuItem
                      onClick={() =>
                        handleStatusChange(
                          inq,
                          inq.status === "resolved" ? "unresolved" : "resolved"
                        )
                      }
                      className="cursor-pointer flex gap-2 items-center px-2 py-1.5 rounded-sm hover:bg-black/5 text-sm outline-none"
                    >
                      <CheckCheck className="w-4 h-4" />
                      {inq.status === "resolved"
                        ? "Mark as Unresolved"
                        : "Mark as Resolved"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleViewDetails(inq)}
                      className="cursor-pointer flex gap-2 items-center px-2 py-1.5 rounded-sm hover:bg-black/5 text-sm outline-none"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid gap-2">
                <div className="rounded-full border border-black/10 p-1 w-max">
                  <span className="w-10 h-10 rounded-full bg-black grid place-content-center font-bold text-white text-sm">
                    {inq.full_name
                      ? inq.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "??"}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium px-3 py-1 rounded-sm bg-black/5">
                    {inq.inquiry_type === "custom_package"
                      ? "Custom Trip"
                      : inq.inquiry_type === "package_reserve"
                      ? "Package Reserve"
                      : inq.inquiry_type === "newsletter"
                      ? "Newsletter"
                      : "Contact"}
                  </span>
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded-sm border flex items-center gap-1 ${
                      inq.status === "resolved"
                        ? "border-green-600/20 text-green-700 bg-green-50"
                        : "border-red-600/20 text-red-700 bg-red-50"
                    }`}
                  >
                    {inq.status === "resolved" ? (
                      <CheckCheck className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {inq.status === "resolved" ? "Resolved" : "Unresolved"}
                  </div>
                </div>
              </div>
              <div className="grid self-start gap-2">
                {/* Name */}
                <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                  <span className="grid place-content-center w-6 h-6 rounded-full bg-black/10 p-1.5">
                    <User className="w-full text-black" />
                  </span>
                  <div className="grid">
                    <span className="text-xs text-black/50">Name</span>
                    <span className="text-sm font-medium text-black truncate">
                      {inq.full_name}
                    </span>
                  </div>
                </div>
                {/* Email */}
                <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                  <span className="grid place-content-center w-6 h-6 rounded-full bg-black/10 p-1.5">
                    <Mail className="w-full text-black" />
                  </span>
                  <div className="grid">
                    <span className="text-xs text-black/50">Email</span>
                    <span
                      className="text-sm font-medium text-black truncate"
                      title={inq.email}
                    >
                      {inq.email}
                    </span>
                  </div>
                </div>
                {/* Phone Number */}
                <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                  <span className="grid place-content-center w-6 h-6 rounded-full bg-black/10 p-1.5">
                    <Phone className="w-full text-black" />
                  </span>
                  <div className="grid">
                    <span className="text-xs text-black/50">Phone Number</span>
                    <span className="text-sm font-medium text-black">
                      {inq.phone_number || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-flow-col items-center justify-between font-medium text-xs border-t border-black/10 pt-5 mt-auto">
                <div className="flex items-center gap-1 text-black/60">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(inq.created_at), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-1 text-black/60">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatDistanceToNow(new Date(inq.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end space-x-2 mx-auto mt-2.5 sm:mt-5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || loading}
          className="border-black/10 bg-transparent text-[#2D2D2D] hover:bg-black/5 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="text-sm font-medium text-[#2D2D2D]">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || loading}
          className="border-black/10 bg-transparent text-[#2D2D2D] hover:bg-black/5 disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
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
