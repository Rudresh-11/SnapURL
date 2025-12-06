"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  SlidersHorizontal,
  Lock,
  Tag,
  Edit,
  Share2,
  BarChart2,
  MoreHorizontal,
  List,
  Columns,
  Grid,
  Copy,
  ExternalLink,
} from "lucide-react";
import ConfirmDialog from "@/components/confirm-dialog";
import useApi from "@/hooks/useApi";
import AlertDemo from "@/components/alertdialog";

// ------------------------------------------------------
// Helper: Auto-generate title from original URL
// ------------------------------------------------------
function parseTitleFromUrl(url) {
  try {
    const hostname = new URL(url).hostname; // google.com
    const name = hostname.replace("www.", "").split(".")[0]; // google
    return name.charAt(0).toUpperCase() + name.slice(1); // Google
  } catch {
    return "Untitled";
  }
}

function LinkCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4 animate-pulse">
      <div className="flex items-start gap-4">

        {/* Checkbox */}
        <div className="w-4 h-4 rounded border border-gray-300 bg-gray-200"></div>

        {/* Icon Circle */}
        <div className="w-10 h-10 rounded-full bg-gray-200"></div>

        {/* Text Section */}
        <div className="flex-1 space-y-3">

          {/* Title */}
          <div className="h-4 w-40 bg-gray-200 rounded"></div>

          {/* Short link */}
          <div className="h-3 w-52 bg-gray-200 rounded"></div>

          {/* Destination URL */}
          <div className="h-3 w-64 bg-gray-200 rounded"></div>

          {/* Metadata Row */}
          <div className="flex gap-6 mt-2">
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}



export default function BitlyLinksPage() {
  const [viewMode, setViewMode] = useState("list");
  const [links, setLinks] = useState([]);
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [alert, setAlert] = useState(null);


  const { data, error, loading, request } = useApi("/url/get");
  const {
    data: deleteData,
    loading: deleteLoading,
    request: deleteRequest,
    error: deleteError
  } = useApi(null, { method: "DELETE" });

  const router = useRouter();

  // ------------------------------------------------------
  // Fetch URLs from API and format them
  // ------------------------------------------------------
  useEffect(() => {
    async function load() {
      const res = await request();
      if (!res?.data) return;

      const formatted = res.data.map((item) => ({
        id: item.id,
        title: parseTitleFromUrl(item.original_url),
        short: `${process.env.NEXT_PUBLIC_BASE_URL}/${item.short_code}`,
        dest: item.original_url,
        clicks: item.total_clicks ?? 0,
        date: new Date(item.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        tags: "No tags",
      }));

      setLinks(formatted);
    }

    load();
  }, [request]);



  const handleCheckboxchange = (e, linkId) => {
    if (e.target.checked) {
      setSelectedLinks([...selectedLinks, linkId]);
    } else {
      setSelectedLinks(selectedLinks.filter(id => id !== linkId));
    }
    console.log(selectedLinks);
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allLinkIds = links.map(link => link.id);
      setSelectedLinks(allLinkIds);
    } else {
      setSelectedLinks([]);
    }
  }

const handleDeleteLinks = async () => {

  // React has prblem w
  let hasError = false;

  for (const linkId of selectedLinks) {
    const res = await deleteRequest(null, `/url/delete/${linkId}`, "DELETE");

    if (!res) {
      hasError = true;
    }
  }

  if (hasError) {
    setAlert({
      type: "error",
      message: "Error deleting links",
      description: "One or more links failed to delete.",
    });
    return;
  }

  setLinks(links.filter(link => !selectedLinks.includes(link.id)));
  setAlert({
    type: "success",
    message: "Links deleted",
    description: `${selectedLinks.length} link(s) removed successfully`,
  });

  setSelectedLinks([]);
};


  return (
    <div className="min-h-screen bg-gray-50">

      {alert && (
        <AlertDemo {...alert} />
      )}

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 w-full">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-3xl font-bold text-gray-900">Snapped Links</h1>
          <button onClick={() => router.push('/dashboard/links/create')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
            + Create link
          </button>
        </div>
      </div>


      {/* FILTER BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search links"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Filter by created date</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Add filters</span>
          </button>
        </div>
      </div>
      {/* ACTION BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between w-full">

          <div className="flex items-center gap-4">
            <input
              onChange={(e) => handleSelectAll(e)}
              type="checkbox"
              checked={selectedLinks.length === links.length && links.length > 0}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">{selectedLinks.length} selected</span>
            <button className="flex items-center gap-1 text-sm text-gray-400 cursor-not-allowed disabled:opacity-50">
              <Lock className="w-4 h-4" />
              <span>Export</span>
            </button>
            {(selectedLinks.length > 0) ? (
              <>
                <ConfirmDialog
                  trigger={<button disabled={deleteLoading} className="text-sm text-blue-500 hover:text-blue-700 font-semibold">{deleteLoading ? "Deleting..." : "Delete"}</button>}
                  title="Delete Links"
                  description={`Are you sure you want to delete ${selectedLinks.length} selected link(s)? This action cannot be undone.`}
                  confirmText="Delete"
                  onConfirm={handleDeleteLinks}
                />
                <ConfirmDialog
                  trigger={<button className="text-sm text-blue-500 hover:text-blue-700 font-semibold">Tag</button>}
                  title="Tag Links"
                  description={`Tagging functionality is not implemented yet.`}
                  confirmText="OK"
                />
              </>
            ) : (
              <>
                <button className="text-sm text-gray-400 font-semibold">Delete</button>
                <button className="text-sm text-gray-400 font-semibold">Tag</button>
              </>
            )}
          </div>
          {deleteError && (
            <div className="text-red-500 text-sm">
              {deleteError.message || "An error occurred while deleting links."}
            </div>
          )}
          <div className="flex items-center gap-4">
            {/* <div className="flex items-center gap-1 border border-gray-300 rounded-md p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded ${
                  viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <List className="w-4 h-4 text-gray-600" />
              </button>

              <button
                onClick={() => setViewMode("columns")}
                className={`p-1.5 rounded ${
                  viewMode === "columns" ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <Columns className="w-4 h-4 text-gray-600" />
              </button>

              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${
                  viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <Grid className="w-4 h-4 text-gray-600" />
              </button>
            </div> */}

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Active</option>
                <option>Archived</option>
                <option>All</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* LINK LIST */}
      {loading ? (
        <>
          <LinkCardSkeleton />
          <LinkCardSkeleton />
          <LinkCardSkeleton />
        </>
      ) : null}
      <div className="px-6 py-6 w-full">

        {links.map((link) => (
          <div
            key={link.id}
            className="bg-white rounded-lg border border-gray-200 p-6 mb-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">

              <input
                onChange={(e) => handleCheckboxchange(e, link.id)}
                checked={selectedLinks.includes(link.id)}
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              <div className="shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Image width={24} height={24} src={`https://www.google.com/s2/favicons?domain=${link.dest}`} alt="Favicon" className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 ">
                  <Link className="hover:underline cursor-pointer" href={`/dashboard/${link.id}`}>
                    {link.title}
                  </Link>
                </h3>

                <div className="flex items-center gap-2 mb-2">
                  <a
                    href={link.short}
                    target="_blank"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {link.short}
                  </a>
                  <button onClick={() => { navigator.clipboard.writeText(link.short) }} className="text-gray-400 hover:text-gray-600">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 hover:underline cursor-pointer">
                  <ExternalLink className="w-4 h-4" />
                  <span>{link.dest}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4" />
                    <span>{link.clicks} clicks</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{link.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    <span>{link.tags}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-md">
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-md">
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-md">
                  <Link href={`/dashboard/${link.id}`}><BarChart2 className="w-4 h-4 text-gray-600" /></Link>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-md">
                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
                </button>
              </div>

            </div>
          </div>
        ))}



        {/* END OF LINKS */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-4 text-gray-400">
            <div className="h-px bg-gray-300 w-20"></div>
            <span className="text-sm">You've reached the end of your links</span>
            <div className="h-px bg-gray-300 w-20"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
