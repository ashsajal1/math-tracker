import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Palette, Cloud, Shield, Bell } from "lucide-react";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import CreateTopic from "@/components/create-topic";
import MigrateTopics from "@/components/migrate-topic";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import UpdateTopic from "@/components/update-topic";

export default function Settings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-8 max-w-7xl mx-auto"
    >
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customize your math tracking experience
        </p>
      </div>
      <MigrateTopics />
      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create Topic</TabsTrigger>
          <TabsTrigger value="update">Update Topic</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <Card>
            <CreateTopic />
          </Card>
        </TabsContent>
        <TabsContent value="update">
          <UpdateTopic />
        </TabsContent>
      </Tabs>

      {/* Appearance */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Palette className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Appearance</h3>
              <p className="text-sm text-muted-foreground">
                Customize how Math Tracker looks
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred theme
                </p>
              </div>
              <Select defaultValue="system">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Bell className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Manage your notification preferences
              </p>
            </div>
          </div>
          <NotificationSettings />
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Cloud className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Data Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage your data and preferences
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync your progress
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full sm:w-auto">
                Export Data
              </Button>
              <p className="text-sm text-muted-foreground">
                Download your progress data
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Privacy */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Privacy</h3>
              <p className="text-sm text-muted-foreground">
                Manage your privacy settings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Share Progress</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to see your progress
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
