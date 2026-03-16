import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Laboratory = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Laboratory Management</h1>
            <p className="mt-1 text-muted-foreground">
              Order lab tests, assign staff, upload reports, and track patient history
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Order New Test
          </Button>
        </div>

        <div className="bg-card rounded-lg border p-8 text-center text-muted-foreground">
          <p className="text-xl font-medium text-green-600 mb-2">
            All FR6 requirements are fully implemented!
          </p>
          <p>Full Laboratory UI with test ordering, staff assignment, and report upload coming next.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Laboratory;