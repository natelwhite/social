<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	let { form, data }: PageProps = $props();
</script>

<style>
header {
	display: grid;
	grid-auto-flow: column;
	justify-content: left;
}
header section {
	padding: 16px 16px;
}


header section form {
	display: none;
	row-gap: 8px;
	margin: 8px 0;
}

header #account:hover form, header #account:focus-within form {
	display: grid;
}

header #account button {
	cursor: pointer;
}

header section h1 {
	font-size: 14pt;
	margin: 0;
	padding: 0;
}
</style>

<header>
	<section>
		<h1>Site Title</h1>
	</section>
	<section id="account">
	{#if data.user}
		<h1>@{data.user.username}</h1>
		<form method="POST" action="?/logout" use:enhance>
			<button type="submit">Log out</button>
		</form>
	{:else}
		<h1>Login/Register</h1>
		<form method="POST" action="?/login" use:enhance>
			<div>
				<label for="login-identifier">Username or Email</label>
				<input
					id="login-identifier"
					name="identifier"
					type="text"
					autocomplete="username"
					value={form?.form === 'login' ? form.identifier : ''}
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
	{/if}
	</section>
</header>