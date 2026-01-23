import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/layouts/settings/layout";

import AppearanceToggleTab from "@/components/appearance-tabs";
import HeadingSmall from "@/components/heading-small";

export default function Appearance() {
  return (
    <AppLayout>
      <Head title="Appearance settings" />

      <h1 className="sr-only">Appearance Settings</h1>

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Appearance settings"
            description="Update your account's appearance settings"
          />
          <AppearanceToggleTab />
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}
