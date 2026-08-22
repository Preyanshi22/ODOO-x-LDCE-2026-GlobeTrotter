import { AlertTriangle, ArrowLeft, ArrowRight, BarChart3, CircleDollarSign, PieChart as PieIcon, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Cell, Pie, PieChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { formatDateRange, formatMoney, tripDays, useApp } from '../../context/AppContext';
import type { BudgetCategory } from '../../types';

const colors = ['#e8a044', '#658b73', '#6d8fb5', '#d87d6e', '#9d91bd'];

export function BudgetPage() {
  const { id } = useParams();
  const { trips, updateTrip, addToast } = useApp();
  const trip = trips.find((item) => item.id === id) ?? trips[0];

  const data = useMemo(
    () => (trip ? Object.entries(trip.budget.categories).map(([name, value]) => ({ name, value })) : []),
    [trip]
  );

  // Dynamic spending per day based directly on activities scheduled per day
  const daily = useMemo(() => {
    if (!trip) return [];
    const totalDays = Math.max(1, tripDays(trip));
    const allActivities = trip.stops.flatMap((s) => s.activities || []);
    const totalActivityCosts = allActivities.reduce((sum, a) => sum + (a.price || 0), 0);
    const baseDailyCost = Math.round(Math.max(0, trip.budget.total - totalActivityCosts) / totalDays);

    return Array.from({ length: Math.min(totalDays, 14) }, (_, index) => {
      const dayNum = index + 1;
      const dayActivities = allActivities.filter((a) => a.day === dayNum);
      const dayActivitySpend = dayActivities.reduce((sum, a) => sum + (a.price || 0), 0);
      const totalDaySpend = baseDailyCost + dayActivitySpend;

      return {
        day: `Day ${dayNum}`,
        spend: totalDaySpend,
        activitiesCount: dayActivities.length,
        activityCost: dayActivitySpend,
        baseCost: baseDailyCost
      };
    });
  }, [trip]);

  if (!trip)
    return (
      <div className="loading-screen">
        <p>Loading budget...</p>
      </div>
    );

  const spent = data.reduce((sum, item) => sum + item.value, 0);
  const remaining = trip.budget.total - spent;

  return (
    <div className="budget-page">
      <Link to={`/trips/${trip.id}/build`} className="back-link">
        <ArrowLeft size={16} /> Back to itinerary
      </Link>
      <div className="page-heading-row">
        <div>
          <p className="eyebrow">Make room for what matters</p>
          <h1>Budget & costs</h1>
          <p className="lede">A clear view of the numbers, so you can focus on the moments.</p>
        </div>
        <div className="budget-date">
          <Wallet size={16} /> {formatDateRange(trip.startDate, trip.endDate)}
        </div>
      </div>

      <div className="budget-kpis">
        <StatCard label="Estimated total" value={formatMoney(trip.budget.total)} detail="Your trip ceiling" icon={<CircleDollarSign />} tone="amber" />
        <StatCard label="Allocated so far" value={formatMoney(spent)} detail={`${Math.round((spent / trip.budget.total) * 100)}% of total`} icon={<TrendingUp />} tone="green" />
        <StatCard label="Room to explore" value={formatMoney(remaining)} detail="Available to spend" icon={<TrendingDown />} tone="blue" />
        <StatCard label="Average per day" value={formatMoney(Math.round(spent / tripDays(trip)))} detail={`${tripDays(trip)} day itinerary`} icon={<BarChart3 />} tone="lilac" />
      </div>

      {remaining < 0 && (
        <div className="budget-alert">
          <AlertTriangle size={18} />
          <span><strong>You’re over budget.</strong> Consider moving a little from “Other” or give yourself more room to wander.</span>
        </div>
      )}

      <div className="budget-chart-grid">
        <article className="card chart-card allocation-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Where it goes</p>
              <h2>Cost breakdown</h2>
            </div>
            <PieIcon size={19} className="muted" />
          </div>
          <div className="donut-layout">
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={96} paddingAngle={3} stroke="none">
                    {data.map((_, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <strong>{formatMoney(spent)}</strong>
                <span>allocated</span>
              </div>
            </div>
            <div className="legend-list">
              {data.map((item, index) => (
                <div key={item.name}>
                  <span>
                    <i style={{ background: colors[index] }} />
                    {item.name}
                  </span>
                  <strong>
                    {formatMoney(item.value)}
                    <small>{Math.round((item.value / spent) * 100)}%</small>
                  </strong>
                </div>
              ))}
            </div>
          </div>
          <ProgressBar value={spent} max={trip.budget.total} label={`${formatMoney(remaining)} remaining`} tone={remaining < 0 ? 'red' : 'green'} />
        </article>

        <article className="card chart-card spend-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Daily rhythm</p>
              <h2>Estimated daily spending</h2>
            </div>
            <span className="chart-period">Activity-based</span>
          </div>
          <div className="bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily} margin={{ top: 8, right: 6, bottom: 0, left: -20 }}>
                <CartesianGrid vertical={false} stroke="#ebe7df" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8a8983' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8a8983' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  cursor={{ fill: '#fff8ed' }}
                  formatter={(val, _name, item) => [
                    `${formatMoney(Number(val))} (Activities: ${formatMoney(item.payload.activityCost)})`,
                    'Estimated Spend'
                  ]}
                />
                <Bar dataKey="spend" fill="#e8a044" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="budget-detail-grid">
        <article className="card budget-tips">
          <span className="eyebrow">A little perspective</span>
          <h2>
            Spend on the story,<br />
            <em>not the stuff.</em>
          </h2>
          <p>
            Your activities make up {Math.round(((trip.budget.categories.Activities || 0) / spent) * 100)}% of this trip budget. That’s a good sign — the best souvenirs are the ones you can’t pack.
          </p>
          <Link to={`/trips/${trip.id}/view`} className="text-link">
            View your itinerary <ArrowRight size={15} />
          </Link>
        </article>

        <article className="card category-table">
          <div className="section-heading">
            <h2>Line items</h2>
            <button
              className="button button-quiet"
              onClick={() => {
                const next = Number(window.prompt('Set your total trip budget (INR ₹)', String(trip.budget.total)));
                if (Number.isFinite(next) && next > 0) {
                  updateTrip({ ...trip, budget: { ...trip.budget, total: next } });
                  addToast('Budget ceiling updated.');
                }
              }}
            >
              Edit budget
            </button>
          </div>
          <div className="budget-lines">
            {(Object.entries(trip.budget.categories) as [BudgetCategory, number][]).map(([name, value], index) => (
              <div key={name}>
                <span className="line-icon" style={{ color: colors[index] }}>
                  {index === 0 ? '↗' : index === 1 ? '⌂' : index === 2 ? '✦' : index === 3 ? '♨' : '＋'}
                </span>
                <span>
                  <strong>{name}</strong>
                  <small>{Math.round((value / spent) * 100)}% of allocated</small>
                </span>
                <b>{formatMoney(value)}</b>
                <ProgressBar value={value} max={Math.max(...Object.values(trip.budget.categories))} tone={index === 0 ? 'amber' : index === 1 ? 'green' : 'blue'} />
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
