'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Mail, Phone, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/dashboard/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { userService } from '@/services/user.service';
import { EmergencyContact } from '@/types';
import { initials } from '@/utils/format';

export default function EmergencyContactsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: contacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: ['emergency-contacts'],
    queryFn: userService.listEmergencyContacts,
  });

  async function addContact(input: { name: string; email: string; phone: string; relation: string }) {
    try {
      await userService.createEmergencyContact({ ...input, priority: contacts.length + 1 });
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      setOpen(false);
      toast.success('Emergency contact added');
    } catch {
      toast.error('Failed to add contact');
    }
  }

  async function removeContact(id: string) {
    try {
      await userService.deleteEmergencyContact(id);
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove contact');
    }
  }

  async function moveContact(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= contacts.length) return;
    const a = contacts[index];
    const b = contacts[targetIndex];
    try {
      await Promise.all([
        userService.updateEmergencyContact(a.id, { priority: b.priority }),
        userService.updateEmergencyContact(b.id, { priority: a.priority }),
      ]);
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
    } catch {
      toast.error('Failed to reorder');
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Emergency Contacts"
        description="People to notify in case of an emergency or inheritance trigger."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white"><Plus className="mr-2 h-4 w-4" /> Add contact</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add emergency contact</DialogTitle>
              </DialogHeader>
              <ContactForm onSubmit={addContact} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((c: EmergencyContact, i: number) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full gradient-primary text-sm font-semibold text-white">
                    {initials(c.name)}
                  </div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.relation}</p>
                  </div>
                </div>
                <Badge className={c.priority === 1 ? 'bg-rose-500/15 text-rose-500' : 'bg-muted text-muted-foreground'}>
                  Priority {c.priority}
                </Badge>
              </div>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {c.email}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {c.phone}</div>
              </div>
              <div className="mt-4 flex gap-1 border-t border-border pt-3">
                <Button variant="ghost" size="sm" disabled={i === 0} onClick={() => moveContact(i, -1)}><ArrowUp className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" disabled={i === contacts.length - 1} onClick={() => moveContact(i, 1)}><ArrowDown className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="ml-auto text-rose-500" onClick={() => removeContact(c.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </DashboardShell>
  );
}

function ContactForm({ onSubmit }: { onSubmit: (input: { name: string; email: string; phone: string; relation: string }) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ec-name">Full name</Label>
        <Input id="ec-name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="ec-email">Email</Label>
        <Input id="ec-email" className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="ec-phone">Phone</Label>
        <Input id="ec-phone" className="mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="ec-rel">Relation</Label>
        <Input id="ec-rel" className="mt-1.5" value={relation} onChange={(e) => setRelation(e.target.value)} />
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
        <Button
          className="gradient-primary text-white"
          onClick={() =>
            onSubmit({
              name: name || 'New Contact',
              email,
              phone,
              relation: relation || 'Family',
            })
          }
        >
          Add contact
        </Button>
      </DialogFooter>
    </div>
  );
}
