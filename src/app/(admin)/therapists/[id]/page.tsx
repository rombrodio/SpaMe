'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  getTherapist,
  assignServiceToTherapist,
  removeServiceFromTherapist,
  addAvailabilityRule,
  deleteAvailabilityRule,
  addTimeOff,
  deleteTimeOff,
} from '@/lib/actions/therapist-actions';
import { getServices } from '@/lib/actions/service-actions';
import type { Service } from '@/lib/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TherapistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [therapist, setTherapist] = useState<Awaited<ReturnType<typeof getTherapist>> | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [t, s] = await Promise.all([getTherapist(id), getServices()]);
    setTherapist(t);
    setAllServices(s);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  if (loading || !therapist) return <div className="p-6">Loading...</div>;

  const assignedServiceIds = therapist.services.map((ts: { service_id: string }) => ts.service_id);
  const availableToAssign = allServices.filter((s) => !assignedServiceIds.includes(s.id));

  async function handleAssignService(formData: FormData) {
    const serviceId = formData.get('service_id') as string;
    if (serviceId) {
      await assignServiceToTherapist(id, serviceId);
      load();
    }
  }

  async function handleRemoveService(serviceId: string) {
    await removeServiceFromTherapist(id, serviceId);
    load();
  }

  async function handleAddRule(formData: FormData) {
    formData.set('therapist_id', id);
    await addAvailabilityRule(formData);
    load();
  }

  async function handleDeleteRule(ruleId: string) {
    await deleteAvailabilityRule(ruleId, id);
    load();
  }

  async function handleAddTimeOff(formData: FormData) {
    formData.set('therapist_id', id);
    await addTimeOff(formData);
    load();
  }

  async function handleDeleteTimeOff(toId: string) {
    await deleteTimeOff(toId, id);
    load();
  }

  return (
    <div className="p-6">
      <Link href="/therapists" className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900">
        <ArrowLeft className="h-4 w-4" /> Back to Therapists
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{therapist.name}</h1>
        <p className="text-sm text-neutral-500">{therapist.email} · {therapist.phone}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assigned Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {therapist.services.map((ts: { service_id: string; service: Service }) => (
                <Badge key={ts.service_id} variant="secondary" className="gap-1">
                  {ts.service?.name}
                  <button onClick={() => handleRemoveService(ts.service_id)}>
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </button>
                </Badge>
              ))}
            </div>
            {availableToAssign.length > 0 && (
              <form action={handleAssignService} className="flex gap-2">
                <Select name="service_id" className="flex-1">
                  <option value="">Add service...</option>
                  {availableToAssign.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
                <Button type="submit" size="sm"><Plus className="h-4 w-4" /></Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Availability Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {therapist.availability.map((rule: { id: string; day_of_week: number; start_time: string; end_time: string }) => (
              <div key={rule.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>{DAYS[rule.day_of_week]}: {rule.start_time} - {rule.end_time}</span>
                <button onClick={() => handleDeleteRule(rule.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
            <form action={handleAddRule} className="flex gap-2">
              <Select name="day_of_week" className="w-28">
                {DAYS.map((d, i) => (
                  <option key={i} value={i}>{d.slice(0, 3)}</option>
                ))}
              </Select>
              <Input name="start_time" type="time" defaultValue="09:00" className="w-24" />
              <Input name="end_time" type="time" defaultValue="17:00" className="w-24" />
              <Button type="submit" size="sm"><Plus className="h-4 w-4" /></Button>
            </form>
          </CardContent>
        </Card>

        {/* Time Off */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Time Off</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {therapist.timeOff.map((to: { id: string; start_datetime: string; end_datetime: string; reason: string | null }) => (
              <div key={to.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>
                  {new Date(to.start_datetime).toLocaleDateString()} - {new Date(to.end_datetime).toLocaleDateString()}
                  {to.reason && <span className="ml-2 text-neutral-500">({to.reason})</span>}
                </span>
                <button onClick={() => handleDeleteTimeOff(to.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
            <form action={handleAddTimeOff} className="flex gap-2">
              <Input name="start_datetime" type="datetime-local" className="flex-1" />
              <Input name="end_datetime" type="datetime-local" className="flex-1" />
              <Input name="reason" placeholder="Reason" className="flex-1" />
              <Button type="submit" size="sm"><Plus className="h-4 w-4" /></Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
