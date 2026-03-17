import { BookOpen, Inbox, Star, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { StatsData } from '@/config/api/dashboard.api';

// ── Single stat card ───────────────────────────────────────────────────────
const StatCard = ({
  title,
  value,
  subLabel,
  subValue,
  icon: Icon,
  badgeLabel,
}: {
  title:      string;
  value:      number;
  subLabel:   string;
  subValue:   string;
  icon:       React.ElementType;
  badgeLabel: string;
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-start justify-between gap-3 mb-2">
        <CardDescription>{title}</CardDescription>
        <Badge variant="outline" className="gap-1 shrink-0">
          <Icon className="h-3.5 w-3.5" />
          {badgeLabel}
        </Badge>
      </div>
      <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
    </CardHeader>
    <CardFooter className="flex-col items-start gap-2 text-sm">
      <div className="flex gap-2 font-medium">
        <Icon className="h-4 w-4" />
        {subLabel}
      </div>
      <div className="text-muted-foreground">{subValue}</div>
    </CardFooter>
  </Card>
);

// ── Section Cards ──────────────────────────────────────────────────────────
export function SectionCards({ data }: { data: StatsData }) {
  const cards = [
    {
      title:      'Total Blogs',
      value:      data.blogs.total,
      icon:       BookOpen,
      badgeLabel: `${data.blogs.active} active`,
      subLabel:   `${data.blogs.active} visible on site`,
      subValue:   `${data.blogs.inactive} hidden`,
    },
    {
      title:      'Total Enquiries',
      value:      data.enquiries.total,
      icon:       Inbox,
      badgeLabel: `${data.enquiries.new} new`,
      subLabel:   `${data.enquiries.new} unread enquiries`,
      subValue:   `${data.enquiries.converted} converted so far`,
    },
    {
      title:      'Testimonials',
      value:      data.testimonials.total,
      icon:       Star,
      badgeLabel: `${data.testimonials.active} active`,
      subLabel:   `${data.testimonials.active} visible on site`,
      subValue:   `${data.testimonials.inactive} hidden`,
    },
    {
      title:      'Enquiry Pipeline',
      value:      data.enquiries.quoted + data.enquiries.contacted,
      icon:       TrendingUp,
      badgeLabel: `${data.enquiries.quoted} quoted`,
      subLabel:   `${data.enquiries.contacted} being contacted`,
      subValue:   `${data.enquiries.closed} closed`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}