import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchoolManagementComponent } from './school-management.component';
import { AddStudentComponent } from './students/add-student/add-student.component';
import { StudentListComponent } from './students/student-list/student-list.component';
import { GenerateSchoolReceiptComponent } from './receipt/generate-school-receipt/generate-school-receipt.component';
import { SchoolReceiptListComponent } from './receipt/school-receipt-list/school-receipt-list.component';
import { FeeTypeComponent } from './fees/fee-type/fee-type.component';
import { FeeStructureComponent } from './fees/fee-structure/fee-structure.component';
import { StudentAcademicComponent } from './academic/student-academic/student-academic.component';
// Standalone fee assignment screen.
import { FeeAssignmentComponent } from './fees/fee-assignment/fee-assignment.component';
import { GradeComponent } from './academic/grade/grade.component';
import { AttendanceListComponent } from './attendance/attendance-list/attendance-list.component';
import { AttendanceMarkComponent } from './attendance/attendance-mark/attendance-mark.component';
import { AttendanceReportComponent } from './attendance/attendance-report/attendance-report.component';
import { SubjectComponent } from './Examination/subject/subject.component';
import { GradeSubjectComponent } from './Examination/grade-subject/grade-subject.component';
import { ExamComponent } from './Examination/exam/exam.component';
import { ExamScheduleComponent } from './Examination/exam-schedule/exam-schedule.component';
import { GradingScaleComponent } from './Examination/grading-scale/grading-scale.component';
import { StudentExamMarksComponent } from './Examination/student-exam-marks/student-exam-marks.component';
import { StudentExamResultComponent } from './Examination/student-exam-result/student-exam-result.component';
 

const routes: Routes = [
  {
    path: '',
    component: SchoolManagementComponent,
    children: [
      {
        path: 'add-student',
        component: AddStudentComponent,
      },
      {
        path: 'student-list',
        component: StudentListComponent,
      },
       {
        path: 'generate-school-receipt',
        component: GenerateSchoolReceiptComponent,
      },
      {
        path: 'school-receipt-list',
        component: SchoolReceiptListComponent,
      },
      {
        path: 'fee-type',
        component: FeeTypeComponent,
      },
      {
        path: 'fee-structure',
        component: FeeStructureComponent,
      },
      {
        path: 'student-academic',
        component: StudentAcademicComponent,
      },
      {
        path: 'fee-assignment',
        component: FeeAssignmentComponent,
      },
      {
        path: 'grade',
        component: GradeComponent,
      },
      {
        path: 'attendance-mark',
        component: AttendanceMarkComponent,
      },
      {
        path: 'attendance-list',
        component: AttendanceListComponent,
      },
      {
        path: 'attendance-report',
        component: AttendanceReportComponent,
      },
      {
        path: 'subject',
        component: SubjectComponent,
      },
      {
        path: 'grade-subject',
        component: GradeSubjectComponent,
      },
      {
        path: 'exam',
        component: ExamComponent,
      },
      {
        path: 'exam-schedule',
        component: ExamScheduleComponent,
      },
      {
        path: 'grading-scale',
        component: GradingScaleComponent,
      },
      {
        path: 'student-exam-marks',
        component: StudentExamMarksComponent,
      },
      {
        path: 'student-exam-result',
        component: StudentExamResultComponent,
      }
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchoolManagementRoutingModule { }
