import { BookOpen, Inbox, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StatsData } from '@/config/api/dashboard.api';

export function SectionCards({ data }: { data: StatsData }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

      {/* Blogs */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total Blogs</CardTitle>
          <BookOpen className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-800">{data.blogs.total}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
           <span className="flex items-center gap-1">
  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
  {data.blogs.active} published
</span>
<span className="flex items-center gap-1">
  <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
  {data.blogs.inactive} draft
</span>
          </div>
        </CardContent>
      </Card>

      {/* Enquiries */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total Enquiries</CardTitle>
          <Inbox className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-800">{data.enquiries.total}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              {data.enquiries.new} new
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              {data.enquiries.converted} converted
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Testimonials</CardTitle>
          <Star className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-800">{data.testimonials.total}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
           <span className="flex items-center gap-1">
  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
  {data.testimonials.active} published
</span>
<span className="flex items-center gap-1">
  <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
  {data.testimonials.inactive} draft
</span>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Enquiry Pipeline</CardTitle>
          <TrendingUp className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-800">
            {data.enquiries.contacted + data.enquiries.quoted}
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              {data.enquiries.contacted} contacted
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
              {data.enquiries.quoted} quoted
            </span>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}