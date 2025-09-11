import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import CreateTopic from "./create-topic";

export default function CreateTopicDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <PlusCircle className="w-3.5 h-3.5" />
          New Subject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CreateTopic />
      </DialogContent>
    </Dialog>
  );
}
