
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Function to check if the database is properly initialized
export const checkDatabaseInitialization = async (): Promise<boolean> => {
  try {
    // Try to query the profiles table
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profilesError) {
      console.error("Error checking profiles table:", profilesError);
      
      // If table doesn't exist, show a message
      if (profilesError.code === '42P01') {
        toast.error("Database tables not found. Please run database migrations to initialize the application.");
        return false;
      }
      
      // If permission denied, might be that tables exist but RLS is preventing access
      if (profilesError.code === '42501') {
        toast.warning("Checking database permissions. You may need to login to access data.");
        return true; // Return true to allow authentication flow to proceed
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error during database initialization check:", error);
    return false;
  }
};

// Handle common errors encountered during database operations
export const handleDatabaseError = (error: any, context: string): void => {
  console.error(`Database error in ${context}:`, error);
  
  if (!error) return;
  
  if (typeof error === 'object' && error.code) {
    switch (error.code) {
      case '42501': // Permission denied
        toast.error("Permission denied. Please check that you're logged in and have the necessary permissions.");
        break;
      case '42P01': // Table does not exist
        toast.error("Database table not found. Database might need initialization.");
        break;
      case '23505': // Unique constraint violation
        toast.error("This record already exists.");
        break;
      default:
        toast.error(`Database error: ${error.message || 'Unknown error'}`);
    }
  } else {
    toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
  }
};
