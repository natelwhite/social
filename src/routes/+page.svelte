<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	let { form }: PageProps = $props();
</script>

<section>
	<h1>Create an account</h1>

	<form method="POST" action="?/signup" use:enhance>
		<div>
			<label for="signup-email">Email</label>
			<input
				id="signup-email"
				name="email"
				type="email"
				autocomplete="email"
				value={form?.form === 'signup' ? form.email : ''}
				required
			/>
		</div>

		<div>
			<label for="signup-username">Username</label>
			<input
				id="signup-username"
				name="username"
				type="text"
				autocomplete="username"
				minlength="3"
				maxlength="30"
				value={form?.form === 'signup' ? form.username : ''}
				required
			/>
		</div>

		<div>
			<label for="signup-password">Password</label>
			<input
				id="signup-password"
				name="password"
				type="password"
				autocomplete="new-password"
				minlength="4"
				required
			/>
		</div>

		{#if form?.form === 'signup' && form.message}
			<p role="alert">{form.message}</p>
		{/if}

		<button type="submit">Create account</button>
	</form>
</section>

<section>
	<h1>Log in</h1>

	<form method="POST" action="?/login" use:enhance>
		<div>
			<label for="login-email">Email</label>
			<input
				id="login-email"
				name="email"
				type="email"
				autocomplete="email"
				value={form?.form === 'login' ? form.email : ''}
				required
			/>
		</div>

		<div>
			<label for="login-password">Password</label>
			<input
				id="login-password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
			/>
		</div>

		{#if form?.form === 'login' && form.message}
			<p role="alert">{form.message}</p>
		{/if}

		<button type="submit">Log in</button>
	</form>
</section>
