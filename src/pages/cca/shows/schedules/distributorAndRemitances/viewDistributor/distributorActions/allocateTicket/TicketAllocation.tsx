import { useEffect, useMemo } from "react";
import { useGetShow } from "@/_lib/@react-client-query/show.ts";
import { useNavigate, useParams } from "react-router-dom";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import LongCard from "@/components/LongCard";
import LongCardItem from "@/components/LongCardItem";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";
import { useGetScheduleInformation, useGetScheduleTickets } from "@/_lib/@react-client-query/schedule.ts";
import AllocateByControlNumber from "./AllocateByControlNumber";
import Breadcrumbs from "@/components/BreadCrumbs";
import NotFound from "@/components/NotFound";
import Loading from "@/components/Loading";
import AllocatedBySeat from "./AllocatedBySeat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { CircleAlertIcon } from "lucide-react";

const TicketAllocation = () => {
  const { scheduleId, showId } = useParams();
  const navigate = useNavigate();

  const { data: schedule, isLoading: loadingSchedule, isError: errorSchedule } = useGetScheduleInformation(scheduleId as string);
  const { data: showData, isLoading: loadingShow, isError: showError } = useGetShow(showId as string, { enabled: schedule?.isOpen });
  const {
    data: tickets,
    isLoading: loadingTickets,
    isError: ticketsError,
  } = useGetScheduleTickets(scheduleId as string, { enabled: schedule?.isOpen });

  const unAllocatedTickets = useMemo(() => {
    if (!tickets) return { total: 0, tickets: [] };

    const t = tickets.filter((ticket) => ticket.status == "not_allocated" && !ticket.isComplimentary);

    return { tickets: t, total: t.length };
  }, [tickets]);

  useEffect(() => {
    if ((!loadingSchedule && schedule && !schedule.isOpen) || showData?.isArchived) {
      navigate(`/${showData?.showType === "majorProduction" ? "majorShows" : "shows"}/schedule/${showId}/${scheduleId}/d&r`, { replace: true });
    }
  }, [loadingSchedule, schedule, navigate, showId, scheduleId]);

  if (loadingShow || loadingSchedule || loadingTickets) {
    return <Loading />;
  }

  return (
    <ContentWrapper className="flex flex-col">
      <Breadcrumbs
        items={[{ name: "Return to Distributor List", href: "" }]}
        backHref={`/${showData?.showType === "majorProduction" ? "majorShows" : "shows"}/schedule/${showId}/${scheduleId}/d&r`}
      />

      {!showData || showError || errorSchedule || !schedule || ticketsError || !tickets ? (
        <NotFound title="Schedule Not Found" description="This Schedule does not exist or have been deleted already" />
      ) : (
        <div className="flex flex-col gap-8 mt-10">
          <h1 className="text-3xl">Allocate Ticket To a Distributor</h1>

          <div>
            <LongCard className="w-fit" labelStyle="!text-xl" label="Show Details">
              <LongCardItem label="Show Title" value={showData.title} />
              <LongCardItem label="Date" value={formatToReadableDate(schedule.datetime + "")} />
              <LongCardItem label="Time" value={formatToReadableTime(schedule.datetime + "")} />
            </LongCard>
          </div>

          {unAllocatedTickets.total === 0 && (
            <div className="flex flex-col bg-muted border shadow-sm border-l-red border-l-4 rounded-md w-full p-3 gap-1">
              <div className="flex items-center gap-2">
                <CircleAlertIcon className="text-red w-4 font-bold" />
                <p className="font-medium text-sm">Note - No More Tickets Available</p>
              </div>

              <p className=" text-sm">
                All tickets for this schedule have already been allocated. You can return to the schedule page to review existing allocations.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {schedule.seatingType == "controlledSeating" ? (
              <>
                <Label>Allocation Method</Label>
                <Tabs defaultValue="number">
                  <TabsList>
                    <TabsTrigger value="number">Auto</TabsTrigger>
                    <TabsTrigger value="seat">By Seat Map</TabsTrigger>
                  </TabsList>
                  <TabsContent value="number">
                    <AllocateByControlNumber
                      scheduleId={scheduleId as string}
                      departmentId={showData.showType !== "majorProduction" ? showData.department?.departmentId ?? "" : ""}
                      unAllocatedTickets={unAllocatedTickets}
                    />
                  </TabsContent>
                  <TabsContent value="seat">
                    <AllocatedBySeat showData={showData} unAllocatedTickets={unAllocatedTickets} />
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  <AllocateByControlNumber
                    scheduleId={scheduleId as string}
                    departmentId={showData.showType !== "majorProduction" ? showData.department?.departmentId ?? "" : ""}
                    unAllocatedTickets={unAllocatedTickets}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </ContentWrapper>
  );
};

export default TicketAllocation;
