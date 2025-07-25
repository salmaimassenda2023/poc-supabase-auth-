// app/drivers/page.js (Server Component)
import { createClient } from '../../supabase/server';
import { redirect } from 'next/navigation';
import DriversList from './DriversList';

export default async function DriversPage() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
        redirect('/login');
    }

    // Fetch drivers server-side
    const { data: drivers, driversError } = await supabase
        .from('drivers')
        .select('*');

    console.log('Drivers error:', driversError);
    console.log('Drivers data:', drivers);
    console.log('Number of drivers:', drivers?.length || 0);

    if (driversError) {
        console.error('Error fetching drivers:', driversError);
    }

    return (
        <DriversList
            user={data.user}
            initialDrivers={drivers || []}
        />
    );
}