'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const agentApplicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
  email: z.string().email('Please enter a valid VIT email address.').regex(/@vitstudent.ac.in$/, 'Must be a vitstudent.ac.in email.'),
  regNo: z.string().min(6, 'Please enter a valid registration number.'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select a gender.' }),
  block: z.string().min(1, 'Please enter your block.'),
});

type AgentApplicationFormValues = z.infer<typeof agentApplicationSchema>;

export function AgentRegistrationForm() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AgentApplicationFormValues>({
    resolver: zodResolver(agentApplicationSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      regNo: '',
      block: '',
    },
  });

  async function onSubmit(data: AgentApplicationFormValues) {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'agentApplications'), {
        ...data,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      });
      toast({
        title: 'Application Submitted!',
        description: 'We have received your application and will review it shortly.',
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was a problem submitting your application. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2" />
          Become an Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Become a Delivery Agent</DialogTitle>
          <DialogDescription>
            Fill out the form below to apply. We'll review your application and get back to you.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIT Email ID</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe2022@vitstudent.ac.in" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="regNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number</FormLabel>
                  <FormControl>
                    <Input placeholder="22BCE0001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="block"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Q" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
