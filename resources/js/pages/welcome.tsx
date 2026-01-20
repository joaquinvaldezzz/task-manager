import { Head } from "@inertiajs/react";

import { Button } from "@/components/ui/button";

export default function Welcome() {
  return (
    <div>
      <Head title="Welcome" />
      <div className="container mx-auto px-4">
        <h1>Welcome</h1>
        <Button>Click me</Button>
      </div>
    </div>
  );
}
