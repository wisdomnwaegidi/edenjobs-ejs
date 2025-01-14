"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplications = exports.getUserJobApplications = exports.appliyForJob = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const input_validation_1 = __importDefault(require("../validations/input.validation"));
const response_controller_1 = require("./response.controller");
const appliyForJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user;
    const safe = input_validation_1.default.appliyForJob.safeParse(req.fields);
    if (!safe.success)
        throw new response_controller_1.ValidationError(safe.error);
    const { content, job_id: id } = safe.data;
    const job = yield prisma_1.default.job.findFirst({
        where: { id },
        select: { applications: true, expires_at: true },
    });
    if (!job)
        throw new response_controller_1.AppError("Job not found", response_controller_1.resCode.NOT_FOUND);
    if (job.expires_at < new Date())
        throw new response_controller_1.AppError("This job is closed for applications", response_controller_1.resCode.NOT_ACCEPTED);
    const alreadyApplied = [...job.applications].find((app) => app.applicant_id === user.applicant_id);
    if (alreadyApplied)
        throw new response_controller_1.AppError("You have already applied for this job", response_controller_1.resCode.CONFLICT);
    const application = yield prisma_1.default.application.create({
        data: {
            content,
            applicant: { connect: { id: user.applicant_id } },
            job: { connect: { id } },
        },
    });
    if (!application)
        throw new response_controller_1.AppError("Application not created", response_controller_1.resCode.NOT_ACCEPTED, application);
    return new response_controller_1.ApiResponse(res, "Applied successfully", { application }, response_controller_1.resCode.CREATED).send();
});
exports.appliyForJob = appliyForJob;
const getUserJobApplications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userJobApplications = yield prisma_1.default.application.findMany({
        where: { applicant: { user: { id: res.locals.user_id } } },
        include: { job: { include: { publisher: true } } },
    });
    res.locals.userJobApplications = userJobApplications;
    next();
});
exports.getUserJobApplications = getUserJobApplications;
const getApplications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.getApplications = getApplications;
//# sourceMappingURL=application.controller.js.map