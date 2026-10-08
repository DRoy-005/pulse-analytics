"use client";



// ============================================================

// Events Page

// ============================================================

//

// Displays analytics events collected by PulseAnalytics.

//

// Features:

// 1. Server-side pagination

// 2. Server-side search

// 3. Event type filter

// 4. Device filter

// 5. Country filter

// 6. Date range filter

// 7. Responsive desktop/mobile layouts

// 8. Event detail panel

// 9. Loading state

// 10. Error state

// 11. Empty state

//

// ============================================================



import { useEffect, useState } from "react";



import {

  ChevronLeft,

  ChevronRight,

  Clock3,

  ExternalLink,

  Filter,

  MapPin,

  Monitor,

  Search,

  User,

  X,

} from "lucide-react";



import {

  getEventTypes,

  getRecentEvents,

  type AnalyticsEvent,

} from "@/lib/api";



import { useAuth } from "@/context/AuthContext";



// ============================================================

// Constants

// ============================================================



const EVENTS_PER_PAGE = 10;



// ============================================================

// Helper Functions

// ============================================================



function formatEventName(name: string) {

  return name

    .replace(/\_/g, " ")

    .replace(/\b\w/g, (letter) =>

      letter.toUpperCase()

    );

}



function formatDate(timestamp: string) {

  return new Date(timestamp).toLocaleString(

    "en-IN",

    {

      dateStyle: "medium",

      timeStyle: "short",

    }

  );

}



// ============================================================

// Events Page

// ============================================================



export default function EventsPage() {
  // ==========================================================
  // Authentication / Workspace
  // ==========================================================

  const {
    workspace,
    loading: authLoading,
  } = useAuth();


  // ----------------------------------------------------------

  // Events

  // ----------------------------------------------------------



  const [events, setEvents] = useState<

    AnalyticsEvent[]

  >([]);



  // ----------------------------------------------------------

  // Pagination

  // ----------------------------------------------------------



  const [currentPage, setCurrentPage] =

    useState(1);



  const [totalPages, setTotalPages] =

    useState(1);



  const [totalEvents, setTotalEvents] =

    useState(0);



  // ----------------------------------------------------------

  // Search

  // ----------------------------------------------------------



  const [searchInput, setSearchInput] =

    useState("");



  const [search, setSearch] =

    useState("");



  // ----------------------------------------------------------

  // Filters

  // ----------------------------------------------------------



  const [filtersOpen, setFiltersOpen] =

    useState(false);



  const [eventTypes, setEventTypes] =

    useState<string[]>([]);



  const [eventName, setEventName] =

    useState("");



  const [deviceType, setDeviceType] =

    useState("");



  const [country, setCountry] =

    useState("");



  const [startDate, setStartDate] =

    useState("");



  const [endDate, setEndDate] =

    useState("");



  // ----------------------------------------------------------

  // Selected event

  // ----------------------------------------------------------



  const [selectedEvent, setSelectedEvent] =

    useState<AnalyticsEvent | null>(null);



  // ----------------------------------------------------------

  // Loading / error

  // ----------------------------------------------------------



  const [loading, setLoading] =

    useState(true);



  const [error, setError] =

    useState<string | null>(null);



  // ==========================================================

  // Load Event Types

  // ==========================================================



  useEffect(() => {
    if (authLoading || !workspace) {
      return;
    }

    const workspaceId = workspace.id;

    async function loadEventTypes() {
      try {
        const response =
          await getEventTypes(
            workspaceId
          );

        setEventTypes(response.data);
      } catch (error) {
        console.error(
          "Failed to load event types:",
          error
        );
      }
    }

    loadEventTypes();
  }, [
    workspace,
    authLoading,
  ]);

  // ==========================================================

  // Load Events

  // ==========================================================



  useEffect(() => {
    if (authLoading || !workspace) {
      return;
    }

    const workspaceId = workspace.id;

    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getRecentEvents(
            workspaceId,
            currentPage,
            EVENTS_PER_PAGE,
            search,
            eventName,
            deviceType,
            country,
            startDate,
            endDate
          );

        setEvents(response.data);

        setTotalEvents(
          response.pagination.total
        );

        setTotalPages(
          response.pagination.totalPages
        );
      } catch (error) {
        console.error(
          "Failed to load events:",
          error
        );

        setError(
          "Unable to load events."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [
    workspace,
    authLoading,
    currentPage,
    search,
    eventName,
    deviceType,
    country,
    startDate,
    endDate,
  ]);

  // ==========================================================

  // Search

  // ==========================================================



  function applySearch() {

    setCurrentPage(1);

    setSearch(searchInput.trim());

  }



  function clearSearch() {

    setSearchInput("");

    setSearch("");

    setCurrentPage(1);

  }



  // ==========================================================

  // Apply Filters

  // ==========================================================



  function clearFilters() {

    setEventName("");

    setDeviceType("");

    setCountry("");

    setStartDate("");

    setEndDate("");

    setCurrentPage(1);

  }



  const filtersActive =

    Boolean(

      eventName ||

        deviceType ||

        country ||

        startDate ||

        endDate

    );



  // ==========================================================

  // Render

  // ==========================================================



  return (

    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-900 dark:text-white">



      {/* ====================================================

          Main Content

          ==================================================== */}



      <main className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">



        {/* ==================================================

            Header

            ================================================== */}



        <div className="mb-7">



          <p className="mb-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">

            Product analytics

          </p>



          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">



            <div>



              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">

                Events

              </h1>



              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">

                Explore the events generated by

                your product.

              </p>



            </div>



            <div className="text-sm text-slate-500 dark:text-slate-400">

              {totalEvents.toLocaleString()}{" "}

              {totalEvents === 1

                ? "event"

                : "events"}

            </div>



          </div>

        </div>



        {/* ==================================================

            Search / Filters

            ================================================== */}



        <div className="mb-4 flex flex-col gap-3 sm:flex-row">



          {/* Search */}



          <div className="relative flex-1">



            <Search

              size={17}

              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"

            />



            <input

              type="text"

              value={searchInput}

              onChange={(event) =>

                setSearchInput(

                  event.target.value

                )

              }

              onKeyDown={(event) => {

                if (event.key === "Enter") {

                  applySearch();

                }

              }}

              placeholder="Search events, users, or pages..."

              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-950"

            />



            {searchInput && (

              <button

                type="button"

                onClick={clearSearch}

                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"

                aria-label="Clear search"

              >

                <X size={16} />

              </button>

            )}



          </div>



          {/* Search button */}



          <button

            type="button"

            onClick={applySearch}

            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-medium text-white transition hover:bg-emerald-600"

          >

            <Search size={16} />

            Search

          </button>



          {/* Filters */}



          <button

            type="button"

            onClick={() =>

              setFiltersOpen(

                (open) => !open

              )

            }

            className={`relative flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${

              filtersActive

                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"

                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"

            }`}

          >

            <Filter size={16} />



            Filters



            {filtersActive && (

              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white">

                {

                  [

                    eventName,

                    deviceType,

                    country,

                    startDate,

                    endDate,

                  ].filter(Boolean).length

                }

              </span>

            )}

          </button>



        </div>



        {/* ==================================================

            Filter Panel

            ================================================== */}



        {filtersOpen && (

          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">



            <div className="mb-5 flex items-center justify-between">



              <div>



                <h2 className="text-sm font-semibold">

                  Event filters

                </h2>



                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">

                  Narrow down the events you want

                  to analyze.

                </p>



              </div>



              {filtersActive && (

                <button

                  type="button"

                  onClick={clearFilters}

                  className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"

                >

                  Clear filters

                </button>

              )}



            </div>



            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">



              {/* Event type */}



              <div>



                <label

                  htmlFor="event-type"

                  className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"

                >

                  Event type

                </label>



                <select

                  id="event-type"

                  value={eventName}

                  onChange={(event) => {

                    setEventName(

                      event.target.value

                    );

                    setCurrentPage(1);

                  }}

                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"

                >



                  <option value="">

                    All events

                  </option>



                  {eventTypes.map(

                    (type) => (

                      <option

                        key={type}

                        value={type}

                      >

                        {formatEventName(

                          type

                        )}

                      </option>

                    )

                  )}



                </select>



              </div>



              {/* Device */}



              <div>



                <label

                  htmlFor="device-type"

                  className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"

                >

                  Device

                </label>



                <select

                  id="device-type"

                  value={deviceType}

                  onChange={(event) => {

                    setDeviceType(

                      event.target.value

                    );

                    setCurrentPage(1);

                  }}

                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"

                >



                  <option value="">

                    All devices

                  </option>



                  <option value="desktop">

                    Desktop

                  </option>



                  <option value="mobile">

                    Mobile

                  </option>



                  <option value="tablet">

                    Tablet

                  </option>



                </select>



              </div>



              {/* Country */}



              <div>



                <label

                  htmlFor="country"

                  className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"

                >

                  Country

                </label>



                <input

                  id="country"

                  type="text"

                  value={country}

                  onChange={(event) => {

                    setCountry(

                      event.target.value

                    );

                    setCurrentPage(1);

                  }}

                  placeholder="e.g. India"

                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"

                />



              </div>



              {/* Start date */}



              <div>



                <label

                  htmlFor="start-date"

                  className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"

                >

                  From

                </label>



                <input

                  id="start-date"

                  type="date"

                  value={startDate}

                  max={endDate || undefined}

                  onChange={(event) => {

                    setStartDate(

                      event.target.value

                    );

                    setCurrentPage(1);

                  }}

                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"

                />



              </div>



              {/* End date */}



              <div>



                <label

                  htmlFor="end-date"

                  className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"

                >

                  To

                </label>



                <input

                  id="end-date"

                  type="date"

                  min={startDate || undefined}

                  onChange={(event) => {

                    setEndDate(

                      event.target.value

                    );

                    setCurrentPage(1);

                  }}

                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"

                />



              </div>



            </div>



          </div>

        )}



        {/* ==================================================

            Active Search

            ================================================== */}



        {search && (

          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">



            <span>

              Search:

            </span>



            <span className="rounded-md bg-slate-200 px-2 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">

              &quot;{search}&quot;

            </span>



            <button

              type="button"

              onClick={clearSearch}

              className="text-emerald-600 hover:underline dark:text-emerald-400"

            >

              Clear

            </button>



          </div>

        )}



        {/* ==================================================

            Error

            ================================================== */}



        {error && (

          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">

            {error}

          </div>

        )}



        {/* ==================================================

            Events Container

            ================================================== */}



        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">



          {/* ==================================================

              Desktop Table

              ================================================== */}



          <div className="hidden overflow-x-auto md:block">



            <table className="w-full text-left">



              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">



                <tr>



                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">

                    Event

                  </th>



                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">

                    User

                  </th>



                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">

                    Page

                  </th>



                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">

                    Device

                  </th>



                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">

                    Time

                  </th>



                </tr>



              </thead>



              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">



                {/* Loading */}



                {loading &&

                  Array.from({

                    length: 6,

                  }).map((_, index) => (

                    <tr key={index}>



                      <td

                        colSpan={5}

                        className="px-5 py-4"

                      >

                        <div className="h-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />

                      </td>



                    </tr>

                  ))}



                {/* Events */}



                {!loading &&

                  events.map((event) => (

                    <tr

                      key={event.id}

                      onClick={() =>

                        setSelectedEvent(

                          event

                        )

                      }

                      className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-900"

                    >



                      <td className="px-5 py-4">



                        <div className="flex items-center gap-3">



                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">



                            <Clock3

                              size={16}

                            />



                          </div>



                          <div>



                            <p className="text-sm font-medium">

                              {formatEventName(

                                event.name

                              )}

                            </p>



                            <p className="mt-0.5 text-xs text-slate-400">

                              {event.id.slice(

                                0,

                                12

                              )}

                              ...

                            </p>



                          </div>



                        </div>



                      </td>



                      <td className="px-5 py-4">



                        <p className="max-w-[180px] truncate text-sm text-slate-700 dark:text-slate-300">

                          {event.user

                            ?.email ||

                            event.user

                              ?.externalId ||

                            "Anonymous"}

                        </p>



                      </td>



                      <td className="px-5 py-4">



                        <p className="max-w-[200px] truncate text-sm text-slate-600 dark:text-slate-400">

                          {event.pageTitle ||

                            event.pageUrl ||

                            "—"}

                        </p>



                      </td>



                      <td className="px-5 py-4">



                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">



                          <Monitor

                            size={15}

                          />



                          {event.session

                            ?.deviceType ||

                            "Unknown"}



                        </div>



                      </td>



                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 dark:text-slate-400">

                        {formatDate(

                          event.timestamp

                        )}

                      </td>



                    </tr>

                  ))}



              </tbody>



            </table>



          </div>



          {/* ==================================================

              Mobile Cards

              ================================================== */}



          <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">



            {loading &&

              Array.from({

                length: 5,

              }).map((_, index) => (

                <div

                  key={index}

                  className="p-4"

                >

                  <div className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />

                </div>

              ))}



            {!loading &&

              events.map((event) => (

                <button

                  key={event.id}

                  type="button"

                  onClick={() =>

                    setSelectedEvent(

                      event

                    )

                  }

                  className="w-full p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900"

                >



                  <div className="flex items-start gap-3">



                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">

                      <Clock3 size={16} />

                    </div>



                    <div className="min-w-0 flex-1">



                      <p className="truncate text-sm font-semibold">

                        {formatEventName(

                          event.name

                        )}

                      </p>



                      <p className="mt-1 truncate text-xs text-slate-500">

                        {event.user?.email ||

                          event.user

                            ?.externalId ||

                          "Anonymous"}

                      </p>



                      <p className="mt-1 text-xs text-slate-400">

                        {formatDate(

                          event.timestamp

                        )}

                      </p>



                    </div>



                    <ChevronRight

                      size={16}

                      className="mt-1 shrink-0 text-slate-400"

                    />



                  </div>



                </button>

              ))}



          </div>



          {/* ==================================================

              Empty State

              ================================================== */}



          {!loading &&

            events.length === 0 && (

              <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">



                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900">



                  <Search

                    size={21}

                    className="text-slate-400"

                  />



                </div>



                <p className="text-sm font-semibold">

                  No events found

                </p>



                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">

                  Try changing your filters or

                  generate some events from your

                  application.

                </p>



              </div>

            )}



          {/* ==================================================

              Pagination

              ================================================== */}



          {!loading &&

            totalEvents > 0 && (

              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">



                <p className="text-xs text-slate-500">

                  Page {currentPage} of{" "}

                  {totalPages}

                </p>



                <div className="flex items-center gap-2">



                  <button

                    type="button"

                    disabled={

                      currentPage === 1

                    }

                    onClick={() =>

                      setCurrentPage(

                        (page) =>

                          Math.max(

                            1,

                            page - 1

                          )

                      )

                    }

                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:hover:bg-slate-900"

                    aria-label="Previous page"

                  >

                    <ChevronLeft

                      size={15}

                    />

                  </button>



                  <button

                    type="button"

                    disabled={

                      currentPage >=

                      totalPages

                    }

                    onClick={() =>

                      setCurrentPage(

                        (page) =>

                          Math.min(

                            totalPages,

                            page + 1

                          )

                      )

                    }

                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:hover:bg-slate-900"

                    aria-label="Next page"

                  >

                    <ChevronRight

                      size={15}

                    />

                  </button>



                </div>



              </div>

            )}



        </div>

      </main>



      {/* ======================================================

          Event Detail Panel

          ====================================================== */}



      {selectedEvent && (

        <>

          {/* Backdrop */}



          <button

            type="button"

            aria-label="Close event details"

            onClick={() =>

              setSelectedEvent(null)

            }

            className="fixed inset-0 z-40 cursor-default bg-slate-950/20 backdrop-blur-[1px]"

          />



          {/* Detail Panel */}



          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">



            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">



              <div>



                <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">

                  Event details

                </p>



                <h2 className="mt-1 text-lg font-semibold">

                  {formatEventName(

                    selectedEvent.name

                  )}

                </h2>



              </div>



              <button

                type="button"

                onClick={() =>

                  setSelectedEvent(null)

                }

                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"

                aria-label="Close"

              >

                <X size={18} />

              </button>



            </div>



            <div className="space-y-6 p-5">



              {/* Timestamp */}



              <section>



                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">

                  Timestamp

                </p>



                <div className="flex items-center gap-3 text-sm">



                  <Clock3

                    size={17}

                    className="text-slate-400"

                  />



                  {formatDate(

                    selectedEvent.timestamp

                  )}



                </div>



              </section>



              {/* User */}



              <section>



                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">

                  User

                </p>



                <div className="flex items-start gap-3">



                  <User

                    size={17}

                    className="mt-0.5 text-slate-400"

                  />



                  <div className="min-w-0">



                    <p className="break-all text-sm font-medium">

                      {selectedEvent.user

                        ?.email ||

                        selectedEvent.user

                          ?.externalId ||

                        "Anonymous user"}

                    </p>



                    {selectedEvent.user && (

                      <p className="mt-1 break-all text-xs text-slate-400">

                        ID:{" "}

                        {

                          selectedEvent.user

                            .id

                        }

                      </p>

                    )}



                  </div>



                </div>



              </section>



              {/* Page */}



              <section>



                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">

                  Page

                </p>



                <div className="flex items-start gap-3">



                  <ExternalLink

                    size={17}

                    className="mt-0.5 text-slate-400"

                  />



                  <div className="min-w-0">



                    <p className="text-sm font-medium">

                      {selectedEvent

                        .pageTitle ||

                        "Unknown page"}

                    </p>



                    {selectedEvent.pageUrl && (

                      <p className="mt-1 break-all text-xs text-slate-400">

                        {selectedEvent.pageUrl}

                      </p>

                    )}



                  </div>



                </div>



              </section>



              {/* Device */}



              <section>



                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">

                  Device

                </p>



                <div className="flex items-start gap-3">



                  <Monitor

                    size={17}

                    className="mt-0.5 text-slate-400"

                  />



                  <div className="text-sm">



                    <p>

                      {selectedEvent

                        .session

                        ?.deviceType ||

                        "Unknown device"}

                    </p>



                    <p className="mt-1 text-xs text-slate-400">

                      {selectedEvent

                        .session

                        ?.browser ||

                        "Unknown browser"}

                      {" · "}

                      {selectedEvent

                        .session

                        ?.operatingSystem ||

                        "Unknown OS"}

                    </p>



                  </div>



                </div>



              </section>



              {/* Location */}



              <section>



                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">

                  Location

                </p>



                <div className="flex items-center gap-3 text-sm">



                  <MapPin

                    size={17}

                    className="text-slate-400"

                  />



                  {selectedEvent.session

                    ?.city ||

                    "Unknown city"}



                  {selectedEvent.session

                    ?.country &&

                    `, ${selectedEvent.session.country}`}



                </div>



              </section>



              {/* Event ID */}



              <section>



                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">

                  Event ID

                </p>



                <p className="break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">

                  {selectedEvent.id}

                </p>



              </section>



            </div>



          </aside>

        </>

      )}



    </div>

  );

}