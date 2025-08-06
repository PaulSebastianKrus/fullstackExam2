<script>
  import PrivateRoute from '../components/PrivateRouteGuard.svelte';
  import { currentUser } from '../stores/generalStore.js';
</script>

<PrivateRoute redirectTo="/login">
  <main>
    <h1>Welcome, {$currentUser.username}!</h1>
    <p>This page is protected and only accessible to authenticated users.</p>
  </main>
</PrivateRoute>
