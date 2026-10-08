"use client";



// ============================================================

// PulseAnalytics Segments

// ============================================================

//

// Features:

// - Load saved segments

// - Create segments

// - Delete segments

// - Display segment rules

// - Calculate real matching-user counts

// - Responsive layout

//

// ============================================================



import {

  useEffect,

  useState,

} from "react";



import {

  Filter,

  Menu,

  Plus,

  Trash2,

  Users,

  X,

} from "lucide-react";



import { Sidebar } from "@/components/dashboard/Sidebar";



import { useAuth } from "@/context/AuthContext";



// ============================================================

// API

// ============================================================



const API_BASE_URL =

  "http\://localhost:5000";



// ============================================================

// Types

// ============================================================



interface SegmentRule {

  id?: string;

  field: string;

  operator: string;

  value: string;

}



interface Segment {

  id: string;

  workspaceId: string;

  name: string;

  description: string | null;

  rules: SegmentRule[];

  createdAt: string;

  updatedAt: string;

}



interface SegmentsResponse {

  success: boolean;

  data: Segment[];

}



interface SegmentResponse {

  success: boolean;

  message: string;

  data: Segment;

}



interface SegmentAudience {

  segmentId: string;

  segmentName: string;

  userCount: number;

  users: {

    id: string;

    externalId: string;

    email: string | null;

    firstSeenAt: string;

    lastSeenAt: string;

  }[];

}



interface SegmentAudienceResponse {

  success: boolean;

  data: SegmentAudience;

}



// ============================================================

// Rule configuration

// ============================================================



const RULE_FIELDS = [

  {

    value: "country",

    label: "Country",

  },

  {

    value: "deviceType",

    label: "Device",

  },

  {

    value: "browser",

    label: "Browser",

  },

  {

    value: "operatingSystem",

    label: "Operating system",

  },

  {

    value: "event",

    label: "Event performed",

  },

];



// ============================================================

// Page

// ============================================================



export default function SegmentsPage() {
  // ----------------------------------------------------------
  // Authenticated workspace
  // ----------------------------------------------------------

  const {
    workspace,
    loading: authLoading,
  } = useAuth();


  // ----------------------------------------------------------

  // Navigation

  // ----------------------------------------------------------



  const [mobileMenuOpen, setMobileMenuOpen] =

    useState(false);



  // ----------------------------------------------------------

  // Segment data

  // ----------------------------------------------------------



  const [segments, setSegments] =

    useState<Segment[]>([]);



  const [audienceCounts, setAudienceCounts] =

    useState<Record<string, number>>({});



  const [audienceLoading, setAudienceLoading] =

    useState<Record<string, boolean>>({});



  const [loading, setLoading] =

    useState(true);



  const [error, setError] =

    useState<string | null>(null);



  // ----------------------------------------------------------

  // Create modal

  // ----------------------------------------------------------



  const [createModalOpen, setCreateModalOpen] =

    useState(false);



  const [creating, setCreating] =

    useState(false);



  // ----------------------------------------------------------

  // Form

  // ----------------------------------------------------------



  const [name, setName] =

    useState("");



  const [description, setDescription] =

    useState("");



  const [rules, setRules] =

    useState<SegmentRule[]>([

      {

        field: "country",

        operator: "equals",

        value: "",

      },

    ]);



  // ----------------------------------------------------------

  // Delete

  // ----------------------------------------------------------



  const [deletingId, setDeletingId] =

    useState<string | null>(null);



  // ==========================================================

  // Load segments

  // ==========================================================



  async function loadSegments() {

    if (authLoading || !workspace) {
      return;
    }

    const workspaceId = workspace.id;

    try {

      setLoading(true);

      setError(null);



      const response =

        await fetch(

          `${API_BASE_URL}/api/segments?workspaceId=${encodeURIComponent(

            workspaceId

          )}`,

          {

            method: "GET",

            cache: "no-store",

          }

        );



      if (!response.ok) {

        throw new Error(

          "Failed to load segments."

        );

      }



      const result =

        (await response.json()) as SegmentsResponse;



      setSegments(result.data);

    } catch (error) {

      console.error(

        "Failed to load segments:",

        error

      );



      setError(

        "Unable to load segments."

      );

    } finally {

      setLoading(false);

    }

  }



  // ==========================================================

  // Load audience count for one segment

  // ==========================================================



  async function loadAudienceCount(

    segmentId: string

  ) {

    if (authLoading || !workspace) {
      return;
    }

    const workspaceId = workspace.id;

    try {

      setAudienceLoading(

        (current) => ({

          ...current,

          [segmentId]: true,

        })

      );



      const response =

        await fetch(

          `${API_BASE_URL}/api/segments/${segmentId}/audience?workspaceId=${encodeURIComponent(

            workspaceId

          )}`,

          {

            method: "GET",

            cache: "no-store",

          }

        );



      if (!response.ok) {

        throw new Error(

          "Failed to load audience."

        );

      }



      const result =

        (await response.json()) as SegmentAudienceResponse;



      setAudienceCounts(

        (current) => ({

          ...current,

          [segmentId]:

            result.data.userCount,

        })

      );

    } catch (error) {

      console.error(

        `Failed to load audience for segment ${segmentId}:`,

        error

      );

    } finally {

      setAudienceLoading(

        (current) => ({

          ...current,

          [segmentId]: false,

        })

      );

    }

  }



  // ==========================================================

  // Initial load

  // ==========================================================



  useEffect(() => {

    if (authLoading || !workspace) {
      return;
    }

    const initialLoad =

      window.setTimeout(() => {

        void loadSegments();

      }, 0);



    return () => {

      window.clearTimeout(

        initialLoad

      );

    };

  }, [workspace, authLoading]);



  // ==========================================================

  // Load audience counts after segments arrive

  // ==========================================================



  useEffect(() => {

    if (authLoading || !workspace || segments.length === 0) {

      return;

    }



    const loadAudiences =

      window.setTimeout(() => {

        segments.forEach(

          (segment) => {

            void loadAudienceCount(

              segment.id

            );

          }

        );

      }, 0);



    return () => {

      window.clearTimeout(

        loadAudiences

      );

    };

  }, [segments, workspace, authLoading]);



  // ==========================================================

  // Create segment

  // ==========================================================



  async function handleCreateSegment() {

    if (authLoading || !workspace) {
      setError("Unable to determine the current workspace.");
      return;
    }

    const workspaceId = workspace.id;

    const trimmedName =

      name.trim();



    if (!trimmedName) {

      return;

    }



    const validRules =

      rules.filter(

        (rule) =>

          rule.value.trim().length > 0

      );



    if (validRules.length === 0) {

      return;

    }



    try {

      setCreating(true);

      setError(null);



      const response =

        await fetch(

          `${API_BASE_URL}/api/segments`,

          {

            method: "POST",



            headers: {

              "Content-Type":

                "application/json",

            },



            body: JSON.stringify({

              workspaceId:

                workspaceId,



              name: trimmedName,



              description:

                description.trim() ||

                null,



              rules: validRules.map(

                (rule) => ({

                  field: rule.field,

                  operator:

                    rule.operator,

                  value:

                    rule.value.trim(),

                })

              ),

            }),

          }

        );



      if (!response.ok) {

        throw new Error(

          "Failed to create segment."

        );

      }



      const result =

        (await response.json()) as SegmentResponse;



      setSegments(

        (current) => [

          result.data,

          ...current,

        ]

      );



      setName("");

      setDescription("");



      setRules([

        {

          field: "country",

          operator: "equals",

          value: "",

        },

      ]);



      setCreateModalOpen(false);

    } catch (error) {

      console.error(

        "Failed to create segment:",

        error

      );



      setError(

        "Unable to create segment."

      );

    } finally {

      setCreating(false);

    }

  }



  // ==========================================================

  // Delete segment

  // ==========================================================



  async function handleDeleteSegment(

    segmentId: string

  ) {

    if (authLoading || !workspace) {
      setError("Unable to determine the current workspace.");
      return;
    }

    const workspaceId = workspace.id;

    try {

      setDeletingId(segmentId);

      setError(null);



      const response =

        await fetch(

          `${API_BASE_URL}/api/segments/${segmentId}?workspaceId=${encodeURIComponent(

            workspaceId

          )}`,

          {

            method: "DELETE",

          }

        );



      if (!response.ok) {

        throw new Error(

          "Failed to delete segment."

        );

      }



      setSegments(

        (current) =>

          current.filter(

            (segment) =>

              segment.id !==

              segmentId

          )

      );



      setAudienceCounts(

        (current) => {

          const next = {

            ...current,

          };



          delete next[segmentId];



          return next;

        }

      );

    } catch (error) {

      console.error(

        "Failed to delete segment:",

        error

      );



      setError(

        "Unable to delete segment."

      );

    } finally {

      setDeletingId(null);

    }

  }



  // ==========================================================

  // Rule helpers

  // ==========================================================



  function updateRule(

    index: number,

    changes: Partial<SegmentRule>

  ) {

    setRules(

      (current) =>

        current.map(

          (rule, ruleIndex) =>

            ruleIndex === index

              ? {

                  ...rule,

                  ...changes,

                }

              : rule

        )

    );

  }



  function addRule() {

    setRules(

      (current) => [

        ...current,

        {

          field: "country",

          operator: "equals",

          value: "",

        },

      ]

    );

  }



  function removeRule(

    index: number

  ) {

    setRules(

      (current) =>

        current.filter(

          (_, ruleIndex) =>

            ruleIndex !== index

        )

    );

  }



  // ==========================================================

  // Helpers

  // ==========================================================



  function getFieldLabel(

    field: string

  ) {

    return (

      RULE_FIELDS.find(

        (item) =>

          item.value === field

      )?.label ?? field

    );

  }



  const totalAudience =

    Object.values(

      audienceCounts

    ).reduce(

      (total, count) =>

        total + count,

      0

    );



  // ==========================================================

  // Render

  // ==========================================================



  return (

    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-900 dark:text-white">



      {/* =====================================================

          Sidebar

          ===================================================== */}



      <Sidebar

        mobileMenuOpen={

          mobileMenuOpen

        }

        onClose={() =>

          setMobileMenuOpen(false)

        }

      />



      <div className="lg:pl-64">



        {/* ===================================================

            Header

            =================================================== */}



        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6 dark:border-slate-800 dark:bg-slate-950/95">



          <button

            type="button"

            onClick={() =>

              setMobileMenuOpen(

                true

              )

            }

            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"

            aria-label="Open navigation menu"

          >

            <Menu size={20} />

          </button>



          <div className="hidden lg:block" />



          <button

            type="button"

            onClick={() =>

              setCreateModalOpen(

                true

              )

            }

            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"

          >

            <Plus size={16} />



            Create segment

          </button>



        </header>



        {/* ===================================================

            Main

            =================================================== */}



        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">



          {/* =================================================

              Heading

              ================================================= */}



          <div className="mb-8">



            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">

              Audience analysis

            </p>



            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-3xl">

              Segments

            </h1>



            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">

              Create reusable audiences based

              on user behavior and attributes.

            </p>



          </div>



          {/* =================================================

              Error

              ================================================= */}



          {error && (

            <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">



              <span>{error}</span>



              <button

                type="button"

                onClick={() =>

                  void loadSegments()

                }

                className="font-medium underline underline-offset-2"

              >

                Retry

              </button>



            </div>

          )}



          {/* =================================================

              Summary cards

              ================================================= */}



          <section className="mb-6 grid gap-4 md:grid-cols-2">



            {/* Saved segments */}



            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">



              <div className="flex items-start justify-between">



                <div>



                  <p className="text-sm text-slate-500 dark:text-slate-400">

                    Saved segments

                  </p>



                  <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">

                    {loading

                      ? "—"

                      : segments.length}

                  </p>



                  <p className="mt-1 text-xs text-slate-400">

                    Reusable audience definitions

                  </p>



                </div>



                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">

                  <Filter size={19} />

                </div>



              </div>



            </div>



            {/* Audience */}



            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">



              <div className="flex items-start justify-between">



                <div>



                  <p className="text-sm text-slate-500 dark:text-slate-400">

                    Matching users

                  </p>



                  <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">

                    {loading

                      ? "—"

                      : Object.keys(

                          audienceCounts

                        ).length ===

                        0

                      ? "—"

                      : totalAudience}

                  </p>



                  <p className="mt-1 text-xs text-slate-400">

                    Across saved segments

                  </p>



                </div>



                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">

                  <Users size={19} />

                </div>



              </div>



            </div>



          </section>



          {/* =================================================

              Segment list

              ================================================= */}



          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">



            <div className="border-b border-slate-200 px-5 py-5 md:px-6 dark:border-slate-800">



              <h2 className="text-base font-semibold text-slate-950 dark:text-white">

                Your segments

              </h2>



              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

                Saved audiences for analyzing

                product behavior.

              </p>



            </div>



            {/* Loading */}



            {loading && (

              <div className="divide-y divide-slate-100 dark:divide-slate-800">



                {[1, 2, 3].map(

                  (item) => (

                    <div

                      key={item}

                      className="flex items-center gap-4 px-5 py-6 md:px-6"

                    >



                      <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />



                      <div className="flex-1">



                        <div className="h-4 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />



                        <div className="mt-2 h-3 w-64 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />



                      </div>



                    </div>

                  )

                )}



              </div>

            )}



            {/* Empty */}



            {!loading &&

              segments.length === 0 && (

                <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">



                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">

                    <Filter size={24} />

                  </div>



                  <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">

                    No segments yet

                  </h3>



                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">

                    Create your first audience

                    segment to start analyzing

                    groups of users.

                  </p>



                  <button

                    type="button"

                    onClick={() =>

                      setCreateModalOpen(

                        true

                      )

                    }

                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"

                  >

                    <Plus size={16} />

                    Create segment

                  </button>



                </div>

              )}



            {/* Segments */}



            {!loading &&

              segments.length > 0 && (

                <div className="divide-y divide-slate-100 dark:divide-slate-800">



                  {segments.map(

                    (segment) => {

                      const count =

                        audienceCounts[

                          segment.id

                        ];



                      const countLoading =

                        audienceLoading[

                          segment.id

                        ];



                      return (

                        <div

                          key={

                            segment.id

                          }

                          className="px-5 py-5 transition-colors hover:bg-slate-50 md:px-6 dark:hover:bg-slate-900/50"

                        >



                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">



                            <div className="flex min-w-0 gap-4">



                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">

                                <Users size={19} />

                              </div>



                              <div className="min-w-0">



                                <h3 className="font-medium text-slate-900 dark:text-white">

                                  {

                                    segment.name

                                  }

                                </h3>



                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

                                  {segment.description ||

                                    "No description"}

                                </p>



                                {/* Rules */}



                                <div className="mt-3 flex flex-wrap gap-2">



                                  {segment.rules.map(

                                    (

                                      rule,

                                      index

                                    ) => (

                                      <span

                                        key={

                                          rule.id ??

                                          `${segment.id}-${index}`

                                        }

                                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300"

                                      >

                                        <span className="font-medium">

                                          {getFieldLabel(

                                            rule.field

                                          )}

                                        </span>



                                        <span className="text-slate-400">

                                          =

                                        </span>



                                        <span>

                                          {

                                            rule.value

                                          }

                                        </span>

                                      </span>

                                    )

                                  )}



                                </div>



                                {/* Audience count */}



                                <div className="mt-4 flex items-center gap-2 text-sm">



                                  <Users

                                    size={

                                      15

                                    }

                                    className="text-emerald-600 dark:text-emerald-400"

                                  />



                                  {countLoading ||

                                  count ===

                                    undefined ? (

                                    <span className="h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />

                                  ) : (

                                    <span className="font-medium text-slate-700 dark:text-slate-300">

                                      {count.toLocaleString(

                                        "en-IN"

                                      )}{" "}

                                      {count ===

                                      1

                                        ? "user"

                                        : "users"}

                                    </span>

                                  )}



                                  <span className="text-slate-400">

                                    matching

                                  </span>



                                </div>



                              </div>



                            </div>



                            {/* Delete */}



                            <button

                              type="button"

                              onClick={() => {

                                void handleDeleteSegment(

                                  segment.id

                                );

                              }}

                              disabled={

                                deletingId ===

                                segment.id

                              }

                              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"

                            >

                              <Trash2

                                size={14}

                              />



                              {deletingId ===

                              segment.id

                                ? "Deleting..."

                                : "Delete"}

                            </button>



                          </div>



                        </div>

                      );

                    }

                  )}



                </div>

              )}



          </section>



        </main>

      </div>



      {/* =====================================================

          Create Segment Modal

          ===================================================== */}



      {createModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">



          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">



            {/* Modal header */}



            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">



              <div>



                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">

                  Create segment

                </h2>



                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

                  Define an audience using one

                  or more rules.

                </p>



              </div>



              <button

                type="button"

                onClick={() =>

                  setCreateModalOpen(

                    false

                  )

                }

                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-900 dark:hover:text-slate-300"

                aria-label="Close modal"

              >

                <X size={18} />

              </button>



            </div>



            {/* Form */}



            <div className="space-y-6 px-6 py-6">



              {/* Name */}



              <div>



                <label

                  htmlFor="segment-name"

                  className="text-sm font-medium text-slate-700 dark:text-slate-300"

                >

                  Segment name

                </label>



                <input

                  id="segment-name"

                  type="text"

                  value={name}

                  onChange={(event) =>

                    setName(

                      event.target.value

                    )

                  }

                  placeholder="e.g. Indian Users"

                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"

                />



              </div>



              {/* Description */}



              <div>



                <label

                  htmlFor="segment-description"

                  className="text-sm font-medium text-slate-700 dark:text-slate-300"

                >

                  Description



                  <span className="ml-1 font-normal text-slate-400">

                    optional

                  </span>

                </label>



                <textarea

                  id="segment-description"

                  value={description}

                  onChange={(event) =>

                    setDescription(

                      event.target.value

                    )

                  }

                  placeholder="Describe who this segment represents..."

                  rows={3}

                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"

                />



              </div>



              {/* Rules */}



              <div>



                <div className="flex items-center justify-between">



                  <div>



                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">

                      Rules

                    </p>



                    <p className="mt-1 text-xs text-slate-400">

                      Users must match these

                      conditions.

                    </p>



                  </div>



                  <button

                    type="button"

                    onClick={addRule}

                    className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"

                  >

                    <Plus size={14} />

                    Add rule

                  </button>



                </div>



                <div className="mt-4 space-y-3">



                  {rules.map(

                    (

                      rule,

                      index

                    ) => (

                      <div

                        key={index}

                        className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"

                      >



                        <div className="grid gap-3 md:grid-cols-[1fr_140px_1fr_auto]">



                          {/* Field */}



                          <select

                            value={

                              rule.field

                            }

                            onChange={(

                              event

                            ) =>

                              updateRule(

                                index,

                                {

                                  field:

                                    event

                                      .target

                                      .value,

                                }

                              )

                            }

                            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"

                          >

                            {RULE_FIELDS.map(

                              (

                                field

                              ) => (

                                <option

                                  key={

                                    field.value

                                  }

                                  value={

                                    field.value

                                  }

                                >

                                  {

                                    field.label

                                  }

                                </option>

                              )

                            )}

                          </select>



                          {/* Operator */}



                          <select

                            value={

                              rule.operator

                            }

                            onChange={(

                              event

                            ) =>

                              updateRule(

                                index,

                                {

                                  operator:

                                    event

                                      .target

                                      .value,

                                }

                              )

                            }

                            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"

                          >

                            <option value="equals">

                              equals

                            </option>



                            <option value="not_equals">

                              does not equal

                            </option>

                          </select>



                          {/* Value */}



                          <input

                            type="text"

                            value={

                              rule.value

                            }

                            onChange={(

                              event

                            ) =>

                              updateRule(

                                index,

                                {

                                  value:

                                    event

                                      .target

                                      .value,

                                }

                              )

                            }

                            placeholder={

                              rule.field ===

                              "country"

                                ? "India"

                                : rule.field ===

                                  "deviceType"

                                ? "mobile"

                                : rule.field ===

                                  "event"

                                ? "feature_used"

                                : "Enter value"

                            }

                            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"

                          />



                          {/* Remove */}



                          <button

                            type="button"

                            onClick={() =>

                              removeRule(

                                index

                              )

                            }

                            disabled={

                              rules.length ===

                              1

                            }

                            className="flex items-center justify-center rounded-lg p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950/30"

                            aria-label="Remove rule"

                          >

                            <X size={17} />

                          </button>



                        </div>



                        {index <

                          rules.length -

                            1 && (

                          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">



                            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />



                            AND



                            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />



                          </div>

                        )}



                      </div>

                    )

                  )}



                </div>



              </div>



            </div>



            {/* Footer */}



            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end dark:border-slate-800">



              <button

                type="button"

                onClick={() =>

                  setCreateModalOpen(

                    false

                  )

                }

                disabled={creating}

                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"

              >

                Cancel

              </button>



              <button

                type="button"

                onClick={() => {

                  void handleCreateSegment();

                }}

                disabled={

                  creating ||

                  !name.trim() ||

                  !rules.some(

                    (rule) =>

                      rule.value

                        .trim()

                        .length > 0

                  )

                }

                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"

              >

                {creating

                  ? "Creating..."

                  : "Create segment"}

              </button>



            </div>



          </div>



        </div>

      )}



    </div>

  );

}