(function () {
  var ns = $.namespace('pxtr.service.performance');

  ns.PerformanceReportService = function (pixetorController, currentColorsService) {
    this.pixetorController = pixetorController;
    this.currentColorsService = currentColorsService;

    this.currentReport = null;
  };

  ns.PerformanceReportService.prototype.init = function () {
    $.subscribe(Events.HISTORY_STATE_SAVED, this.createReport_.bind(this));
  };

  ns.PerformanceReportService.prototype.createReport_ = function () {
    var report = new ns.PerformanceReport(
      this.pixetorController.getPixetor(),
      this.currentColorsService.getCurrentColors().length);

    if (!report.equals(this.currentReport)) {
      $.publish(Events.PERFORMANCE_REPORT_CHANGED, [report]);
      this.currentReport = report;
    }
  };

  ns.PerformanceReportService.prototype.hasProblem = function () {
    return this.currentReport && this.currentReport.hasProblem();
  };
})();
