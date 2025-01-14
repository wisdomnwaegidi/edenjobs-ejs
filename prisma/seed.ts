import { faker } from "@faker-js/faker";
import db from "./index";

function randomFromArray<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}
function uniqueRandomFromArray<T>(arr: T[]): () => T | null {
	const remainingEle = [...arr];
	return function () {
		if (remainingEle.length === 0) {
			return null;
		}

		let randInd = Math.floor(Math.random() * remainingEle.length);
		return remainingEle.splice(randInd, 1)[0];
	};
}

const NO_OF = {
	USER: 30,
	APPLICANT: 5,
	EMPLOYER: 5,
	JOB: 30,
	JOBCATEGORY: 5,
	APPLICATION: 10,
} as const;

const company_size_enum = ["startup", "small", "medium", "large", "others"];
const job_type_enum = ["part-time", "full-time", "contract"];
const experience_level_enum = ["entry-level", "mid-level", "advance-level"];
const work_schedule_enum = ["flexibly hours", "night shift", "day time"];
const job_stability_enum = ["long term", "short term"];
const location_type_enum = ["remote", "on-site"];

async function seedDB() {
	const job_categories = await seedJobCategory();
	const users = await seedUser();
	const applicants = [...users]
		.filter(
			(user) =>
				user.applicant_details?.id != undefined &&
				user.applicant_details?.id != null
		)
		.map((user) => user.applicant_details);
	const employers = [...users]
		.filter(
			(user) =>
				user.employer_details != undefined && user.employer_details != null
		)
		.map((user) => user.employer_details);
	const jobs = await seedJob();
	await seedApplication();

	async function seedUser() {
		const users = [];
		for (let i = 0; i < NO_OF.USER; i++) {
			const isApplicant = Math.random() < 0.5;
			const user = await db.user.create({
				data: {
					first_name: faker.person.firstName(),
					last_name: faker.person.lastName(),
					email: faker.internet.email({ provider: "gmail" }),
					password:
						"$2b$10$qTD1CXcTFhVxcozODRqnH.xgoUIiMBPAado2BqGnQ7qTNChfLXm.a",
					username: faker.internet.userName(),
					is_applicant: isApplicant,
					applicant_details: isApplicant
						? {
								create: {
									avatar: faker.internet.avatar(),
									cv_resume_url: faker.internet.url(),
									job_field: randomFromArray([
										"Tech",
										"Finance",
										"Business",
										"others",
									]),
									job_stability: randomFromArray(job_stability_enum),
									location: faker.location.secondaryAddress(),
									location_type: randomFromArray(location_type_enum),
									years_of_experience: randomFromArray([1, 2, 3, 4, 4.5]),
									skill_level: randomFromArray(experience_level_enum),
									preferred_job_type: randomFromArray(job_type_enum),
									skill_set: "others|eating|fooding",
									work_schedule: randomFromArray(work_schedule_enum),
								},
						  }
						: {},
					employer_details: !isApplicant
						? {
								create: {
									company_description: faker.commerce.productDescription(),
									company_name: faker.company.name(),
									company_email: faker.internet.email({ provider: "co" }),
									company_logo: faker.image.avatarLegacy(),
									company_website: faker.internet.url(),
									company_size: randomFromArray(company_size_enum),
									culture: "good values|nothing else",
									company_location_city: faker.location.city(),
									company_location_state: faker.location.state(),
									company_location_street: faker.location.streetAddress(),
									industry: randomFromArray([
										"Tech",
										"Finance",
										"Business",
										"others",
									]),
								},
						  }
						: {},
				},
				include: { applicant_details: true, employer_details: true },
			});
			users.push(user);
		}
		return users;
	}

	async function seedJob() {
		const jobs = [];

		for (let i = 0; i < NO_OF.JOB; i++) {
			const job = await db.job.create({
				data: {
					title: faker.person.jobTitle(),
					city_location: faker.location.city(),
					benefits: "good things|love|joy|fanta|etc",
					summary: faker.lorem.paragraph(),
					employment_type: randomFromArray(job_type_enum),
					experience_level: randomFromArray(experience_level_enum),
					expires_at: faker.date.soon({
						days: faker.number.int({ max: 100, min: 1 }),
					}),
					description_and_requirement: faker.lorem.paragraphs(4),
					min_quaification: randomFromArray([
						"B. Sc",
						"B. Tech",
						"Masters",
						"Phd",
						"Prof",
					]),
					is_remote: Math.random() < 0.5,
					max_salary: faker.number.int({ min: 500, max: 5000 }),
					min_salary: faker.number.int({ max: 100 }),
					required_experience_years: randomFromArray([1, 2, 3, 4, 5, 6]),
					state_location: faker.location.state(),
					required_skills: "cooking|fighting|giveing life to christ|and so on",
					responsibilities: "come|go|check|do your job|chop",
					salary_period: randomFromArray([
						"monthly",
						"weekly",
						"bi-weekly",
						"yearly",
					]),
					category_id: randomFromArray(job_categories).id,
					publisher_id: randomFromArray(employers)!.id,
					published_at: faker.date.recent({
						days: faker.number.int({ max: 4, min: 1 }),
					}),
				},
			});
			jobs.push(job);
		}
		return jobs;
	}

	async function seedJobCategory() {
		const cats = [];

		for (let i = 0; i < NO_OF.JOBCATEGORY; i++) {
			const cat = await db.jobCategory.create({
				data: { name: faker.internet.domainWord() },
			});
			cats.push(cat);
		}
		return cats;
	}

	async function seedApplication() {
		const applications = [];

		for (let i = 0; i < applicants.length - 2; i++) {
			const application = await db.application.create({
				data: {
					content: faker.lorem.paragraphs(30),
					applicant: {
						connect: { id: uniqueRandomFromArray(applicants)()?.id },
					},
					job: { connect: { id: randomFromArray(jobs).id } },
				},
			});
			applications.push(application);
		}
		return applications;
	}
}

seedDB().then(() => console.log("Database seeded successfully"));
