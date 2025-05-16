
import { setupDemoAccounts } from './demoAccounts';

const setupInitialData = async () => {
  try {
    // Setup demo accounts
    await setupDemoAccounts();
    console.log("Initial data setup complete");
  } catch (error) {
    console.error("Error setting up initial data:", error);
  }
};

export default setupInitialData;
