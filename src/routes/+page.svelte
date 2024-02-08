<script>
	let loading = false;
	let error = '';

	let channel = '';
	let tokenAmount = 0;
	let minAmount = 1;
	let maxAmount = 100;

	let randomDistribution = false;

	const generateCSV = async () => {
		loading = true;

		if (!channel) {
			error = 'Channel name is required';
			loading = false;
			return;
		}

		if (
			randomDistribution &&
			(!minAmount || !maxAmount || minAmount < 0 || maxAmount < 1 || minAmount > maxAmount)
		) {
			error = 'Invalid token range';
			loading = false;
			return;
		}

		let response;
		try {
			response = await fetch(`/channel-followers/${channel}/`, {
				method: 'GET',
				headers: {
					'content-type': 'application/json'
				}
			});
		} catch {
			error = 'Error fetching data';
			loading = false;
			return;
		}

		try {
			const csvData = ['address,tokens'];

			const users = await response.json();
			if (!users.length) {
				error = 'No users found in the channel';
				loading = false;
				return;
			}

			for (const user of users) {
				const userTokens = randomDistribution
					? Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
					: tokenAmount;
				if (user.verifications) csvData.push(`${user.verifications[0]},${userTokens}`);
			}
			if (csvData.length == 1) {
				error = 'No users with addresses found in the channel';
				loading = false;
				return;
			}

			const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.setAttribute('href', url);
			a.setAttribute('download', `${channel}-claim.csv`);
			a.click();
		} catch {
			error = 'Error generating csv file';
			loading = false;
			return;
		}

		loading = false;
	};
</script>

<div class="h-full w-full">
	<div class="m-auto max-w-sm mt-10">
		<h1 class="text-center text-3xl font-bold mb-4">Claimcaster CSV Generator</h1>
		<div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
			<div class="mb-4">
				<label class="block text-gray-700 text-sm font-bold mb-2">
					Farcaster channel name
					<input
						class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						id="username"
						type="text"
						bind:value={channel}
					/>
				</label>
			</div>

			<div class="flex items-center mb-4">
				<label class="text-sm text-gray-700 font-bold">
					<input
						type="checkbox"
						class="bg-gray-50 border-gray-300 focus:ring-3 focus:ring-blue-300 h-4 w-4 rounded"
						bind:checked={randomDistribution}
					/>
					Use random distribution
				</label>
			</div>

			{#if randomDistribution}
				<div class="mb-4 flex gap-2">
					<label class="block text-gray-700 text-sm font-bold mb-2">
						Min tokens per user
						<input
							class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							id="username"
							type="text"
							bind:value={minAmount}
						/>
					</label>
					<label class="block text-gray-700 text-sm font-bold mb-2">
						Max tokens per user
						<input
							class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							id="username"
							type="text"
							bind:value={maxAmount}
						/>
					</label>
				</div>
			{:else}
				<div class="mb-4">
					<label class="block text-gray-700 text-sm font-bold mb-2">
						Tokens per user
						<input
							class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							id="username"
							type="text"
							bind:value={tokenAmount}
						/>
					</label>
				</div>
			{/if}

			<div class="text-center">
				{#if loading}
					<button
						class="w-full bg-blue-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
						disabled
					>
						Generating...
					</button>
				{:else}
					<button
						class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
						on:click={generateCSV}
						type="button"
					>
						Generate CSV
					</button>
				{/if}
				{#if error}
					<p class="text-red-500 text-xs italic mt-2">{error}</p>
				{/if}
			</div>
		</div>
	</div>
</div>
