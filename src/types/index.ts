export type UserRole = 'CUSTOMER' | 'CONSULTANT' | 'ADMIN';

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  nationality?: string | null;
  passportNumber?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED';
  profile?: UserProfile | null;
  createdAt?: string;
  applicationCount?: number;
  assignedCasesCount?: number;
}

export interface OfficialVisaSource {
  id: string;
  visaProgramId: string;
  country: string;
  authorityName: string;
  officialUrl: string;
  lastVerifiedDate: string;
  notes?: string | null;
  isOfficialGovernment: boolean;
}

export interface DocumentRequirement {
  id: string;
  visaProgramId: string;
  title: string;
  description: string;
  isMandatory: boolean;
  allowedMimeTypes: string;
  maxSizeBytes: number;
}

export interface VisaProgram {
  id: string;
  title: string;
  country: string;
  countryCode: string;
  flagEmoji: string;
  category: 'TOURIST' | 'BUSINESS' | 'STUDENT' | 'TRANSIT' | 'WORK';
  flow: 'INDIA_TO_WORLD' | 'WORLD_TO_INDIA';
  processingTime: string;
  validity: string;
  entryType: string;
  feeAmount: number;
  feeCurrency: string;
  description: string;
  eligibilitySummary: string;
  officialPortalUrl: string;
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  officialSources?: OfficialVisaSource[];
  documentRequirements?: DocumentRequirement[];
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'DOCUMENTS_REQUESTED'
  | 'RESUBMITTED'
  | 'PROCESSING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface ApplicationStatusHistory {
  id: string;
  applicationId: string;
  changedById: string;
  previousStatus: string;
  newStatus: string;
  changeReason?: string | null;
  createdAt: string;
  changedBy?: {
    email: string;
    profile?: UserProfile | null;
    role: string;
  };
}

export interface InternalCaseNote {
  id: string;
  applicationId: string;
  authorId: string;
  noteText: string;
  isConfidential: boolean;
  createdAt: string;
  author?: {
    email: string;
    profile?: UserProfile | null;
    role: string;
  };
}

export interface PrivateDocument {
  id: string;
  applicationId?: string | null;
  uploaderId: string;
  requirementId?: string | null;
  originalName: string;
  storedFilename: string;
  fileSizeBytes: number;
  mimeType: string;
  checksumSha256?: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REQUIRES_REUPLOAD';
  rejectionNotes?: string | null;
  uploadedAt: string;
  requirement?: {
    title: string;
  } | null;
  application?: {
    referenceNumber: string;
    destinationCountry: string;
  } | null;
}

export interface ConsultantAssignment {
  id: string;
  applicationId: string;
  consultantId: string;
  assignedById: string;
  assignedAt: string;
  notes?: string | null;
  isActive: boolean;
  consultant?: {
    id: string;
    email: string;
    profile?: UserProfile | null;
  };
}

export interface VisaApplication {
  id: string;
  referenceNumber: string;
  customerId: string;
  visaProgramId: string;
  destinationCountry: string;
  visaCategory: string;
  status: ApplicationStatus;
  submissionDate: string;
  travelDate?: string | null;
  applicantNotes?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: User;
  visaProgram?: VisaProgram;
  assignments?: ConsultantAssignment[];
  documents?: PrivateDocument[];
  statusHistory?: ApplicationStatusHistory[];
  caseNotes?: InternalCaseNote[];
}

export interface Appointment {
  id: string;
  referenceNumber: string;
  customerId: string;
  consultantId?: string | null;
  applicationId?: string | null;
  serviceType: string;
  appointmentDate: string;
  timeSlot: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELLED';
  notes?: string | null;
  meetingLink?: string | null;
  createdAt: string;
  customer?: {
    email: string;
    profile?: UserProfile | null;
  };
  consultant?: {
    email: string;
    profile?: UserProfile | null;
  };
  application?: {
    referenceNumber: string;
    destinationCountry: string;
  };
}

export interface Enquiry {
  id: string;
  userId?: string | null;
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  destinationCountry: string;
  visaType: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  detailsJson?: string | null;
  createdAt: string;
  user?: {
    email: string;
    role: string;
    profile?: UserProfile | null;
  } | null;
}
