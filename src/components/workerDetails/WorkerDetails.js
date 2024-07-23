import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';


const WorkerDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [workerAbsences, setWorkerAbsences] = useState([]);
	const [workerName, setWorkerName] = useState('');

	
	useEffect(() => {
		const fetchWorkerAbsences = async () => {
			try {

				const compiledConflictResponses = [
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: true },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
					{ conflicts: false },
				  ];
				const response = await fetch(
					`https://front-end-kata.brighthr.workers.dev/api/absences`,
				);
				const responseData = await response.json();

				const data = responseData.map((item, index) => ({
					...item,
					...compiledConflictResponses[index],
				  }));

				// Track employee names
				const employeeNames = new Map();
				// Modify data to include conflict property
				const objData = JSON.stringify(data);
				const parseData = JSON.parse(objData)
				const modifiedData = parseData.map((item) => {

					
					const fullName = `${item?.employee?.firstName} ${item?.employee?.lastName}`;
					if (employeeNames.has(fullName)) {
					  employeeNames.set(fullName, true);
					} else {
					  employeeNames.set(fullName, false);
					}
					return { ...item };
				  });


				     // Update conflicts in the modified data
					const finalData = modifiedData.map((item) => {
						const fullName = `${item.employee.firstName} ${item.employee.lastName}`;
						return {
						...item,
						conflict: employeeNames.get(fullName)
						};
					});

	

				const workerAbsences = finalData.filter(
					(absence) => absence.employee.id === id,
				);

				const absencesWithConflicts = await Promise.all(
					workerAbsences.map(async (absence) => {
						const conflictResponse = await fetch(
							`https://front-end-kata.brighthr.workers.dev/api/conflict/${absence.id}`,
						);
						const conflictData = await conflictResponse.json();
						return { ...absence, conflicts: conflictData.conflicts };
					}),
				);

				if (absencesWithConflicts.length > 0) {
					const { employee } = absencesWithConflicts[0];
					setWorkerName(`${employee.firstName} ${employee.lastName}`);
				}

				setWorkerAbsences(absencesWithConflicts);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchWorkerAbsences();
	}, [id]);

	const formatDate = (dateString) => {
		return format(new Date(dateString), 'dd-MM-yyyy');
	};

	const calculateEndDate = (startDate, days) => {
		const endDate = addDays(new Date(startDate), days);
		return format(endDate, 'dd-MM-yyyy');
	};

	return (
		<div
			className='container mx-auto mt-4 p-4 sm:mt-10 sm:p-10'
			data-testid='worker-details'>
			<button
				onClick={() => navigate(-1)}
				className='bg-fuchsia-950 text-white px-4 py-2 rounded mb-4 '>
				Back
			</button>
			<h1 className='text-2xl font-bold mb-4 '>{workerName}'s Absences</h1>
			<div className='bg-white shadow-md rounded-lg p-4 sm:p-6'>
				<table className='min-w-full text-sm sm:text-base'>
					<thead>
						<tr className='bg-teal-500 text-white'>
							<th className='px-2 sm:px-4 py-2 text-left'>Start Date</th>
							<th className='px-2 sm:px-4 py-2 text-left'>End Date</th>
							<th className='px-2 sm:px-4 py-2 text-left'>Absence Type</th>
							<th className='px-2 sm:px-4 py-2 text-left'>Approved</th>
							<th className='px-2 sm:px-4 py-2 text-left'>Conflicts</th>
						</tr>
					</thead>
					<tbody>
						{workerAbsences.map((absence) => (
							<tr
								key={absence.id}
								className='border-t'>
								<td className='px-2 sm:px-4 py-2'>
									{formatDate(absence.startDate)}
								</td>
								<td className='px-2 sm:px-4 py-2'>
									{calculateEndDate(absence.startDate, absence.days)}
								</td>
								<td className='px-2 sm:px-4 py-2'>{absence.absenceType}</td>
								<td className='px-2 sm:px-4 py-2'>
									{absence.approved ? (
										<span className='text-green-500'>Approved</span>
									) : (
										<span className='text-red-500'>Pending</span>
									)}
								</td>
								<td className='px-2 sm:px-4 py-2'>
									{/* =={JSON.stringify(absence)} */}
									{absence.conflicts ? (
										<div className='text-red-500'>
												<div key={absence.id}>
													{`${absence.employee.firstName} ${
														absence.employee.lastName
													} (${formatDate(
														absence.startDate,
													)} - ${calculateEndDate(
														absence.startDate,
														absence.days,
													)})`}
												</div>
										</div>
									) : (
										<div key={absence.id}>
													{`${absence.employee.firstName} ${
														absence.employee.lastName
													} (${formatDate(
														absence.startDate,
													)} - ${calculateEndDate(
														absence.startDate,
														absence.days,
													)})`}
												</div>
										// <span className='text-green-500'>No Conflicts</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default WorkerDetails;
