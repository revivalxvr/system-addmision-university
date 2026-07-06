/*
  Warnings:

  - You are about to drop the column `lectureId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `Student` table. All the data in the column will be lost.
  - Added the required column `lectureId` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearId` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `StudyPlanCourse` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Course` DROP FOREIGN KEY `Course_lectureId_fkey`;

-- DropForeignKey
ALTER TABLE `StudyPlanCourse` DROP FOREIGN KEY `StudyPlanCourse_scheduleId_fkey`;

-- AlterTable
ALTER TABLE `Course` DROP COLUMN `lectureId`;

-- AlterTable
ALTER TABLE `Schedule` ADD COLUMN `lectureId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Student` DROP COLUMN `semester`,
    ADD COLUMN `lectureId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `StudyPlan` ADD COLUMN `yearId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `StudyPlanCourse` ADD COLUMN `courseId` VARCHAR(191) NOT NULL,
    MODIFY `scheduleId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_lectureId_fkey` FOREIGN KEY (`lectureId`) REFERENCES `Lecture`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_lectureId_fkey` FOREIGN KEY (`lectureId`) REFERENCES `Lecture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudyPlan` ADD CONSTRAINT `StudyPlan_yearId_fkey` FOREIGN KEY (`yearId`) REFERENCES `AcademyYear`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudyPlanCourse` ADD CONSTRAINT `StudyPlanCourse_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudyPlanCourse` ADD CONSTRAINT `StudyPlanCourse_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
