import { pgTable, text, numeric, timestamp, integer, boolean, uuid, date, check } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

// ============================================
// TABLE DEFINITIONS
// ============================================

// 1. Users table
export const users = pgTable('users', {
  email: text('email').primaryKey(),
  fullName: text('full_name').notNull(),
  phoneNumber: text('phone_number'),
  avatarUrl: text('avatar_url'),
  department: text('department'),
  position: text('position'),
  accessLevel: integer('access_level').notNull().default(4), // 1: Admin, 2: Giám đốc, 3: Trưởng phòng, 4: Nhân viên
  projectIds: text('project_ids').array(),
  createdAt: timestamp('created_at').defaultNow(),
})

// 2. Departments table (Phòng ban)
export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  parentId: uuid('parent_id').references((): any => departments.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 3. Job Levels table (Cấp bậc)
export const jobLevels = pgTable('job_levels', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  levelScore: integer('level_score').default(0),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 4. Job Positions table (Chức vụ)
export const jobPositions = pgTable('job_positions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 5. Job Functions table (Chức năng nhiệm vụ)
export const jobFunctions = pgTable('job_functions', {
  id: uuid('id').primaryKey().defaultRandom(),
  departmentId: uuid('department_id').references(() => departments.id, { onDelete: 'cascade' }),
  positionId: uuid('position_id').references(() => jobPositions.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 6. Company Info table
export const companyInfo = pgTable('company_info', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  taxCode: text('tax_code'),
  legalRepresentative: text('legal_representative'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return [
    check('id_check', sql`id = 1`)
  ]
})

// 7. Branches table
export const branches = pgTable('branches', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  managerName: text('manager_name'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 8. Constants table
export const constants = pgTable('constants', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: text('category').notNull(),
  value: text('value').notNull(),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

// 8.1 Files table (Đính kèm)
export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').default('Tài liệu'), // Tài liệu, Ảnh, Đính kèm, Khác
  fileName: text('file_name'),
  fileUrl: text('file_url'),
  tableName: text('table_name').notNull(),
  refId: uuid('ref_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: text('created_by'),
})

// 3. Projects table
export const projects = pgTable('projects', {
  projectId: text('project_id').primaryKey(),
  projectName: text('project_name').notNull(),
  description: text('description'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  status: text('status').default('Đang thực hiện'),
  managerName: text('manager_name').references(() => users.email),
  memberNames: text('member_names').array(),
  avatarUrl: text('avatar_url'),
  contractValue: numeric('total_planned_budget', { precision: 15, scale: 2 }).default('0'), // Renamed from total_planned_budget
  contingencyBudget: numeric('contingency_budget', { precision: 15, scale: 2 }).default('0'),
  currencyCode: text('currency_code').default('VND'),
  plannedDuration: integer('planned_duration').default(0),
  actualStartDate: date('actual_start_date'),
  actualEndDate: date('actual_end_date'),
  progressPercent: numeric('progress_percent', { precision: 5, scale: 2 }).default('0'),
  actualCost: numeric('actual_cost', { precision: 15, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: text('created_by').references(() => users.email),
})

// 4. Tasks table
export const tasks = pgTable('tasks', {
  taskId: text('task_id').primaryKey(),
  projectId: text('project_id').references(() => projects.projectId, { onDelete: 'cascade' }),
  taskName: text('task_name').notNull(),
  taskCategory: text('task_category'),
  taskUnit: text('task_unit'),
  wbs: text('wbs'),
  description: text('description'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  status: text('status').default('Chưa bắt đầu'),
  createdAt: timestamp('created_at').defaultNow(),
})

// 5. Resources table (quản lý tài nguyên + tồn kho)
export const resources = pgTable('resources', {
  resourceId: text('resource_id').primaryKey(),
  resourceName: text('resource_name').notNull(),
  groupName: text('group_name'),
  unit: text('unit'),
  unitPrice: numeric('unit_price', { precision: 15, scale: 2 }).default('0'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  manager: text('manager').references(() => users.email),
  priority: text('priority'),
  status: text('status'),
  documents: text('documents').array(),
  notes: text('notes'),
  quantityIn: numeric('quantity_in', { precision: 15, scale: 2 }).default('0'),
  quantityOut: numeric('quantity_out', { precision: 15, scale: 2 }).default('0'),
  quantityBalance: numeric('quantity_balance', { precision: 15, scale: 2 }).default('0'),
  projectId: text('project_id').references(() => projects.projectId, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
})

// 6. Project Inflows table (Dòng tiền vào - Tạm ứng, Thanh toán đợt)
export const projectInflows = pgTable('project_inflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: text('project_id').references(() => projects.projectId, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  date: date('date').notNull(),
  description: text('description'),
  type: text('type'), // 'Tạm ứng', 'Thanh toán đợt', 'Khác'
  createdAt: timestamp('created_at').defaultNow(),
})

// 7. Suppliers table (NCC)
export const ncc = pgTable('ncc', {
  id: text('id').primaryKey(),
  supplierGroup: text('supplier_group'),
  taxCode: text('tax_code').unique(),
  supplierName: text('supplier_name').notNull(),
  address: text('address'),
  phoneNumber: text('phone_number'),
  contactPerson: text('contact_person'),
  attachments: text('attachments').array(),
  createdAt: timestamp('created_at').defaultNow(),
})

// 8. PYC table (Phiếu yêu cầu)
export const pyc = pgTable('pyc', {
  requestId: text('request_id').primaryKey(),
  title: text('title').notNull(),
  requestType: text('request_type'),
  status: text('status').default('Chờ duyệt'),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).default('0'),
  priority: text('priority'),
  vatDisplay: text('vat_display').default('10%'),
  vatValue: numeric('vat_value', { precision: 5, scale: 2 }).default('0.1'),
  createdBy: text('created_by').references(() => users.email),
  approvedBy: text('approved_by').references(() => users.email),
  createdAt: timestamp('created_at').defaultNow(),
  approvedAt: timestamp('approved_at'),
  attachments: text('attachments').array(),
  notes: text('notes'),
  projectId: text('project_id').references(() => projects.projectId, { onDelete: 'set null' }),
})

// 8.5 System_Templates table
export const systemTemplates = pgTable('system_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type').notNull(), // PYC, DNTT, EXPORT, IMPORT, CHECKLIST
  fileUrl: text('file_url').notNull(),
  description: text('description'),
  projectId: text('project_id').references(() => projects.projectId),
  category: text('category'),
  templateCode: text('template_code'),
  issuingDepartmentId: uuid('issuing_department_id').references(() => departments.id),
  status: text('status').default('Hiệu lực'),
  effectiveFrom: timestamp('effective_from'),
  effectiveTo: timestamp('effective_to'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 9. PYC_Detail table
export const pycDetail = pgTable('pyc_detail', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestId: text('request_id').references(() => pyc.requestId, { onDelete: 'cascade' }),
  category: text('category'),
  taskDescription: text('task_description'),
  materialCode: text('material_code'),
  itemName: text('item_name').notNull(),
  unit: text('unit'),
  quantity: numeric('quantity', { precision: 15, scale: 2 }),
  unitPrice: numeric('unit_price', { precision: 15, scale: 2 }),
  vatStatus: text('vat_status'),
  vatDisplay: text('vat_display'),
  vatValue: numeric('vat_value', { precision: 5, scale: 2 }),
  // lineTotal is computed in database via GENERATED column
  lineTotal: numeric('line_total', { precision: 15, scale: 2 }),
  notes: text('notes'),
})

// 10. DNTT table (Đề nghị thanh toán)
export const dntt = pgTable('dntt', {
  paymentRequestId: text('payment_request_id').primaryKey(),
  projectId: text('project_id').references(() => projects.projectId, { onDelete: 'set null' }),
  requestDate: date('request_date').notNull(),
  documentDate: date('document_date'),
  documentReference: text('document_reference'),
  invoiceNumber: text('invoice_number'),
  paymentReason: text('payment_reason'),
  quantity: numeric('quantity', { precision: 15, scale: 2 }),
  unitPriceGross: numeric('unit_price_gross', { precision: 15, scale: 2 }),
  vatRate: numeric('vat_rate', { precision: 5, scale: 2 }),
  unitPriceNet: numeric('unit_price_net', { precision: 15, scale: 2 }),
  vatAmount: numeric('vat_amount', { precision: 15, scale: 2 }),
  totalNet: numeric('total_net', { precision: 15, scale: 2 }),
  totalGross: numeric('total_gross', { precision: 15, scale: 2 }),
  paymentMethod: text('payment_method'),
  payer: text('payer'),
  requesterName: text('requester_name').references(() => users.email),
  supplierName: text('supplier_name'),
  expenseType: text('expense_type'),
  expenseGroup: text('expense_group'),
  contractType: text('contract_type'),
  pycClassification: text('pyc_classification'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

// 10. XN table (Xuất nhập kho)
export const xn = pgTable('xn', {
  inventoryId: text('inventory_id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: text('created_by').references(() => users.email),
  type: text('type').notNull(), // 'NK' or 'XK'
  receiver: text('receiver'),
  status: text('status').default('Chờ kiểm tra'),
  attachments: text('attachments').array(),
})

// 11. XN_Details table
export const xnDetails = pgTable('xn_details', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // 'NK' or 'XK'
  inventoryId: text('inventory_id').references(() => xn.inventoryId, { onDelete: 'cascade' }),
  productCode: text('product_code').references(() => resources.resourceId),
  requestId: text('request_id').references(() => pyc.requestId),
  requestStatus: text('request_status'),
  productName: text('product_name').notNull(),
  unit: text('unit'),
  inventorySubId: text('inventory_sub_id'),
  quantity: numeric('quantity', { precision: 15, scale: 2 }),
  unitPrice: numeric('unit_price', { precision: 15, scale: 2 }),
  // lineTotal is computed in database via GENERATED column
  lineTotal: numeric('line_total', { precision: 15, scale: 2 }),
  transactionDate: date('transaction_date'),
  receiver: text('receiver'),
  category: text('category'),
  taskName: text('task_name'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: text('created_by').references(() => users.email),
})

// 12. Checklist_Data table (mẫu biểu)
export const checklistData = pgTable('checklist_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentCode: text('document_code').unique().notNull(),
  paymentMethod: text('payment_method'),
  documentType: text('document_type'),
  paymentGroup: text('payment_group'),
  fileId: text('file_id'),
  createdAt: timestamp('created_at').defaultNow(),
})

// 13. Checklist table (thực hiện)
export const checklist = pgTable('checklist', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').references(() => checklistData.id),
  projectId: text('project_id').references(() => projects.projectId, { onDelete: 'cascade' }),
  index: integer('index'),
  documentCode: text('document_code').notNull(),
  paymentMethod: text('payment_method'),
  documentType: text('document_type'),
  mergedType: text('merged_type'),
  paymentGroup: text('payment_group'),
  fileId: text('file_id'),
  status: text('status').default('Chưa hoàn thành'),
  completedBy: text('completed_by').references(() => users.email),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

// 14. Notifications table (Thông báo)
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.email, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('info'), // info, success, warning, error
  isRead: boolean('is_read').default(false),
  link: text('link'),
  createdAt: timestamp('created_at').defaultNow(),
})

// ============================================
// RELATIONS
// ============================================

// Users relations
export const usersRelations = relations(users, ({ many }) => ({
  managedProjects: many(projects, { relationName: 'manager' }),
  createdProjects: many(projects, { relationName: 'creator' }),
  managedResources: many(resources),
  pycRequests: many(pyc),
  dnttRequests: many(dntt),
  xnRecords: many(xn),
  xnDetailRecords: many(xnDetails),
  completedChecklists: many(checklist),
  notifications: many(notifications),
}))

// Projects relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  manager: one(users, {
    fields: [projects.managerName],
    references: [users.email],
    relationName: 'manager',
  }),
  creator: one(users, {
    fields: [projects.createdBy],
    references: [users.email],
    relationName: 'creator',
  }),
  tasks: many(tasks),
  checklists: many(checklist),
}))

// Tasks relations
export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.projectId],
  }),
}))

// Resources relations
export const resourcesRelations = relations(resources, ({ one, many }) => ({
  manager: one(users, {
    fields: [resources.manager],
    references: [users.email],
  }),
  xnDetails: many(xnDetails),
}))

// PYC relations
export const pycRelations = relations(pyc, ({ one, many }) => ({
  creator: one(users, {
    fields: [pyc.createdBy],
    references: [users.email],
  }),
  details: many(pycDetail),
  xnDetails: many(xnDetails),
}))

// PYC_Detail relations
export const pycDetailRelations = relations(pycDetail, ({ one }) => ({
  pyc: one(pyc, {
    fields: [pycDetail.requestId],
    references: [pyc.requestId],
  }),
}))

// DNTT relations
export const dnttRelations = relations(dntt, ({ one }) => ({
  requester: one(users, {
    fields: [dntt.requesterName],
    references: [users.email],
  }),
}))

// XN relations
export const xnRelations = relations(xn, ({ one, many }) => ({
  creator: one(users, {
    fields: [xn.createdBy],
    references: [users.email],
  }),
  details: many(xnDetails),
}))

// XN_Details relations
export const xnDetailsRelations = relations(xnDetails, ({ one }) => ({
  xn: one(xn, {
    fields: [xnDetails.inventoryId],
    references: [xn.inventoryId],
  }),
  product: one(resources, {
    fields: [xnDetails.productCode],
    references: [resources.resourceId],
  }),
  request: one(pyc, {
    fields: [xnDetails.requestId],
    references: [pyc.requestId],
  }),
  creator: one(users, {
    fields: [xnDetails.createdBy],
    references: [users.email],
  }),
}))

// Checklist_Data relations
export const checklistDataRelations = relations(checklistData, ({ many }) => ({
  checklists: many(checklist),
}))

// Checklist relations
export const checklistRelations = relations(checklist, ({ one }) => ({
  template: one(checklistData, {
    fields: [checklist.templateId],
    references: [checklistData.id],
  }),
  project: one(projects, {
    fields: [checklist.projectId],
    references: [projects.projectId],
  }),
  completedByUser: one(users, {
    fields: [checklist.completedBy],
    references: [users.email],
  }),
}))

// Notifications relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.email],
  }),
}))

// ============================================
// TYPE EXPORTS (for TypeScript inference)
// ============================================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert

export type Resource = typeof resources.$inferSelect
export type NewResource = typeof resources.$inferInsert

export type Supplier = typeof ncc.$inferSelect
export type NewSupplier = typeof ncc.$inferInsert

export type PYC = typeof pyc.$inferSelect
export type NewPYC = typeof pyc.$inferInsert

export type PYCDetail = typeof pycDetail.$inferSelect
export type NewPYCDetail = typeof pycDetail.$inferInsert

export type DNTT = typeof dntt.$inferSelect
export type NewDNTT = typeof dntt.$inferInsert

export type XN = typeof xn.$inferSelect
export type NewXN = typeof xn.$inferInsert

export type XNDetail = typeof xnDetails.$inferSelect
export type NewXNDetail = typeof xnDetails.$inferInsert

export type ChecklistData = typeof checklistData.$inferSelect
export type NewChecklistData = typeof checklistData.$inferInsert

export type Checklist = typeof checklist.$inferSelect
export type NewChecklist = typeof checklist.$inferInsert

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert

