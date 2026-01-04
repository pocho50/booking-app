(function () {
  const defaultI18n = {
    daysShort: ["DO", "LU", "MA", "MI", "JU", "VI", "SA"],
    months: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    labels: {
      previous: "Anterior",
      next: "Siguiente",
      details: "Detalle",
      notAvailable: "No disponible",
      loading: "Cargando",
      close: "Cerrar",
      corner: "Home",
    },
    popover: {
      client: "Cliente",
      from: "Desde",
      to: "Hasta",
      confirmed: "Confirmado",
      active: "Activo",
      yes: "Sí",
      no: "No",
    },
  };

  const defaultOptions = {
    mes: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    idRecurso: null,
    jsonUrl: null,
    jsonData: null,
    desdeYear: new Date().getFullYear() - 3,
    hastaYear: new Date().getFullYear() + 2,
    i18n: null,
    onMonthChange: null,
    onReservationClick: null,
    onAvailableDayClick: null,
    disableInternalPopover: false,
    complete: null,
    topOffset: 130,
  };

  const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

  const deepMerge = (base, override) => {
    if (!override) {
      return base;
    }

    const result = Array.isArray(base) ? [...base] : { ...base };
    Object.keys(override).forEach((key) => {
      const baseVal = base ? base[key] : undefined;
      const overrideVal = override[key];

      if (
        baseVal &&
        overrideVal &&
        typeof baseVal === "object" &&
        typeof overrideVal === "object" &&
        !Array.isArray(baseVal) &&
        !Array.isArray(overrideVal)
      ) {
        result[key] = deepMerge(baseVal, overrideVal);
        return;
      }

      result[key] = overrideVal;
    });

    return result;
  };

  const addDaysToDate = (date, amount) => {
    const tzOff = date.getTimezoneOffset() * 60 * 1000;

    var t = date.getTime();

    t += 1000 * 60 * 60 * 24 * amount;

    const d = new Date();
    d.setTime(t);

    const tzOff2 = d.getTimezoneOffset() * 60 * 1000;

    if (tzOff !== tzOff2) {
      const diff = tzOff2 - tzOff;
      t += diff;
      d.setTime(t);
    }

    return d;
  };

  const escapeHtmlAttribute = (value) => {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  };

  const parseReservationDatesInPlace = (reservation) => {
    if (
      reservation.fechaDesde instanceof Date &&
      reservation.fechaHasta instanceof Date
    ) {
      return;
    }

    const sd = String(reservation.fechaDesde).split(/[-]/);
    const ed = String(reservation.fechaHasta).split(/[-]/);

    reservation.fechaDesde = new Date(
      Number(sd[0]),
      Number(sd[1]) - 1,
      Number(sd[2])
    );
    reservation.fechaHasta = new Date(
      Number(ed[0]),
      Number(ed[1]) - 1,
      Number(ed[2])
    );
  };

  class VanillaCalendar {
    constructor(container, options) {
      if (!container) {
        throw new Error("VanillaCalendar: container is required");
      }

      this.container =
        typeof container === "string"
          ? document.querySelector(container)
          : container;

      if (!this.container) {
        throw new Error("VanillaCalendar: container not found");
      }

      this.options = { ...defaultOptions, ...(options || {}) };
      if (this.options.month != null) {
        this.options.mes = this.options.month;
      }
      if (this.options.fromYear != null) {
        this.options.desdeYear = this.options.fromYear;
      }
      if (this.options.toYear != null) {
        this.options.hastaYear = this.options.toYear;
      }
      if (this.options.resourceId != null) {
        this.options.idRecurso = this.options.resourceId;
      }

      this.i18n = deepMerge(defaultI18n, this.options.i18n);

      this._date = new Date();

      this._currentMonth = this.options.mes;
      this._currentYear = this.options.year;

      this._daysInMonth = 0;
      this._reservedDaysTotal = 0;
      this._inactiveDaysTotal = 0;

      this._headTop = 0;
      this._isFixed = false;

      this._boundOnScroll = this._onScroll.bind(this);
      this._boundOnClick = this._onClick.bind(this);
      this._boundOnChange = this._onChange.bind(this);
      this._boundOnDocumentClick = this._onDocumentClick.bind(this);

      this._openPopoverEl = null;
      this._popover = null;

      this._loadingOverlayEl = null;
      this._previousContainerPosition = null;
    }

    async render(optionsOverride) {
      if (optionsOverride) {
        this.options = { ...this.options, ...optionsOverride };
        if (this.options.month != null) {
          this.options.mes = this.options.month;
        }
        if (this.options.fromYear != null) {
          this.options.desdeYear = this.options.fromYear;
        }
        if (this.options.toYear != null) {
          this.options.hastaYear = this.options.toYear;
        }
        if (this.options.resourceId != null) {
          this.options.idRecurso = this.options.resourceId;
        }

        if (this.options.i18n != null) {
          this.i18n = deepMerge(defaultI18n, this.options.i18n);
        }
      }

      const previousMonth = this._currentMonth;
      const previousYear = this._currentYear;

      const shouldTriggerMonthChange =
        typeof this.options.onMonthChange === "function" &&
        (this.options.mes !== previousMonth ||
          this.options.year !== previousYear);

      const willFetchJsonUrl =
        this.options.jsonUrl != null && this.options.jsonData == null;

      const shouldShowLoading = shouldTriggerMonthChange || willFetchJsonUrl;

      if (shouldShowLoading) {
        this._showLoading();
      }

      try {
        if (shouldTriggerMonthChange) {
          const maybeData = await this.options.onMonthChange({
            mes: this.options.mes,
            year: this.options.year,
            previousMes: previousMonth,
            previousYear,
            calendar: this,
          });

          if (maybeData != null) {
            this.options.jsonData = maybeData;
          }
        }

        this._currentMonth = this.options.mes;
        this._currentYear = this.options.year;

        const data = await this._ensureData();

        this._daysInMonth = daysInMonth(this.options.mes, this.options.year);
        this._reservedDaysTotal = 0;
        this._inactiveDaysTotal = 0;

        this._teardownEvents();
        this.container.innerHTML = "";

        const table = document.createElement("table");
        table.id = "reservas";
        table.className = "calendar-table";
        table.innerHTML = this._renderTheadHtml();
        this.container.appendChild(table);

        const { tbodyHtml, resourceCount } = this._renderTbodyHtml(data || []);

        const tbody = document.createElement("tbody");
        tbody.innerHTML = tbodyHtml;
        table.appendChild(tbody);

        const occupancyEl = this.container.querySelector("#calendar_ocupacion");
        if (occupancyEl) {
          occupancyEl.textContent = this._getOccupancyPercent(resourceCount);
        }

        this._setupEvents();

        if (typeof this.options.complete === "function") {
          this.options.complete.call(this.container);
        }
      } finally {
        if (shouldShowLoading) {
          this._hideLoading();
        }
      }
    }

    _showLoading() {
      if (this._loadingOverlayEl) {
        return;
      }

      const computedPosition = window.getComputedStyle(this.container).position;
      if (computedPosition === "static") {
        this._previousContainerPosition = this.container.style.position;
        this.container.style.position = "relative";
      }

      const overlay = document.createElement("div");
      overlay.className = "calendar-loading-overlay";
      overlay.innerHTML = `<div class="calendar-spinner" aria-label="${escapeHtmlAttribute(
        this.i18n.labels.loading
      )}" role="status"></div>`;

      this.container.appendChild(overlay);
      this._loadingOverlayEl = overlay;
    }

    _hideLoading() {
      if (this._loadingOverlayEl) {
        this._loadingOverlayEl.remove();
      }

      this._loadingOverlayEl = null;

      if (this._previousContainerPosition != null) {
        this.container.style.position = this._previousContainerPosition;
        this._previousContainerPosition = null;
      }
    }

    destroy() {
      this._teardownEvents();
      this._closePopover();
      this._hideLoading();
      this.container.innerHTML = "";
    }

    async _ensureData() {
      if (this.options.jsonData) {
        return this.options.jsonData;
      }

      if (!this.options.jsonUrl) {
        return null;
      }

      const response = await fetch(this.options.jsonUrl, {
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error(
          `VanillaCalendar: failed to load jsonUrl (${response.status})`
        );
      }

      const data = await response.json();
      this.options.jsonData = data;
      return data;
    }

    _renderTheadHtml() {
      const optionSelectHtml = this._renderMonthYearSelectHtml();
      const daysHtml = this._renderDaysHeaderHtml();

      return `
        <thead>
          <tr class="month">
            <th rowspan="3" ><span class="res-icon"></span></th>
            <th colspan="31">
              <div id="reserva_nav" class="calendar-nav">
                <div class="calendar-nav-left">
                  <a href="#" class="btn anterior" data-action="prev">${escapeHtmlAttribute(
                    this.i18n.labels.previous
                  )}</a>
                </div>
                <div class="calendar-nav-center">
                  ${optionSelectHtml}
                </div>
                <div class="calendar-nav-right">
                  <span id="calendar_ocupacion" class="calendar-ocupacion"></span>
                  <a href="#" class="btn siguiente" data-action="next">${escapeHtmlAttribute(
                    this.i18n.labels.next
                  )}</a>
                </div>
              </div>
            </th>
          </tr>
          ${daysHtml}
        </thead>
      `;
    }

    _renderDaysHeaderHtml() {
      let content = '<tr class="number">';

      for (let i = 1; i <= this._daysInMonth; i++) {
        content += `<th>${i}</th>`;
      }

      content += "</tr>";
      content += '<tr class="days">';

      for (let j = 1; j <= this._daysInMonth; j++) {
        const d = new Date(this.options.year, this.options.mes - 1, j);
        const dayName = this.i18n.daysShort[d.getDay()];
        content += `<th>${escapeHtmlAttribute(dayName)}</th>`;
      }

      content += "</tr>";
      return content;
    }

    _renderMonthYearSelectHtml() {
      let optionSelect =
        '<select class="calendar drop_mes" data-role="drop_mes">';

      for (let i = 1; i <= 12; i++) {
        const selected = this.options.mes === i ? "selected" : "";
        optionSelect += `<option ${selected} value="${i}">${escapeHtmlAttribute(
          this.i18n.months[i - 1]
        )}</option>`;
      }

      optionSelect += "</select>";
      optionSelect +=
        '<select class="calendar drop_year" data-role="drop_year">';

      for (let y = this.options.desdeYear; y <= this.options.hastaYear; y++) {
        const selected = this.options.year === y ? "selected" : "";
        optionSelect += `<option ${selected} value="${y}">${y}</option>`;
      }

      optionSelect += "</select>";
      return optionSelect;
    }

    _renderTbodyHtml(data) {
      let content = "";
      let resourceCount = 0;

      (data || []).forEach((val) => {
        resourceCount += 1;

        if (
          this.options.idRecurso == null ||
          this.options.idRecurso === val.id
        ) {
          const baseRowHtml = this._buildBaseRowHtml(val.nombre, val.id);
          const rowWithReservationsHtml = this._applyReservationsToRow(
            baseRowHtml,
            val.reservas || []
          );
          content += rowWithReservationsHtml;
        }
      });

      return { tbodyHtml: content, resourceCount };
    }

    _buildBaseRowHtml(resourceName, resourceId) {
      let content = `<td class="prop">${escapeHtmlAttribute(
        resourceName
      )}</td>`;

      for (let i = 1; i <= this._daysInMonth; i++) {
        content += `<td data-recurso="${escapeHtmlAttribute(
          resourceId
        )}" data-fecha="${i}/${this.options.mes}/${
          this.options.year
        }" class="disponible"></td>`;
      }

      return `<tr>${content}</tr>`;
    }

    _applyReservationsToRow(rowHtml, reservations) {
      let nreservations = 0;
      const rowEl = document.createElement("tbody");
      rowEl.innerHTML = rowHtml;

      let tr = rowEl.querySelector("tr");
      if (!tr) {
        return rowHtml;
      }

      (reservations || []).forEach((reservation) => {
        parseReservationDatesInPlace(reservation);

        const reservationId = this._getReservationId(
          reservation,
          nreservations
        );

        if (
          (reservation.fechaHasta.getMonth() < this.options.mes - 1 &&
            reservation.fechaHasta.getFullYear() <= this.options.year) ||
          (reservation.fechaDesde.getMonth() > this.options.mes - 1 &&
            reservation.fechaDesde.getFullYear() >= this.options.year)
        ) {
          nreservations += 1;
          return;
        }

        let loopDates = true;
        let dateCmp = reservation.fechaDesde;

        let icon =
          nreservations % 2 === 0 ? "res-icon" : "res-icon res-icon-alt";
        icon = reservation.confirmado === 0 ? "res-icon res-icon-red" : icon;
        icon = reservation.activo === 0 ? "res-icon res-icon-off" : icon;

        while (loopDates) {
          if (
            dateCmp.getFullYear() === this.options.year &&
            dateCmp.getMonth() === this.options.mes - 1
          ) {
            const td = tr.querySelector(
              `td:nth-child(${dateCmp.getDate() + 1})`
            );

            if (td) {
              td.insertAdjacentHTML(
                "beforeend",
                this._buildReservationCellHtml(
                  reservation,
                  reservationId,
                  dateCmp,
                  icon
                )
              );

              if (reservation.activo !== 0) {
                td.removeAttribute("class");
                this._reservedDaysTotal += 1;
              } else {
                td.className = "nodisponible";
                this._inactiveDaysTotal += 1;
              }
            }
          }

          dateCmp = addDaysToDate(dateCmp, 1);

          if (dateCmp > reservation.fechaHasta) {
            loopDates = false;
            break;
          }
        }

        nreservations += 1;
      });

      return tr.outerHTML;
    }

    _getReservationId(reservation, indexFallback) {
      if (!reservation) {
        return String(indexFallback);
      }

      if (reservation.id != null) {
        return String(reservation.id);
      }

      if (reservation.reservaId != null) {
        return String(reservation.reservaId);
      }

      if (reservation.__calendarId != null) {
        return String(reservation.__calendarId);
      }

      const fd = reservation.fechaDesde ? String(reservation.fechaDesde) : "";
      const fh = reservation.fechaHasta ? String(reservation.fechaHasta) : "";
      const cn = reservation.clienteNombre
        ? String(reservation.clienteNombre)
        : "";
      const ca = reservation.clienteApellido
        ? String(reservation.clienteApellido)
        : "";

      const synthetic = `${fd}|${fh}|${cn}|${ca}|${indexFallback}`;
      reservation.__calendarId = synthetic;
      return synthetic;
    }

    _buildReservationCellHtml(
      reservation,
      reservationId,
      currentDate,
      iconClass
    ) {
      const placement = currentDate.getDate() < 16 ? "right" : "left";

      const title =
        reservation.activo !== 0
          ? `${reservation.clienteNombre || ""} ${
              reservation.clienteApellido || ""
            }`.trim()
          : this.i18n.labels.notAvailable;

      const bodyHtml = this._getDefaultPopoverContent(reservation);

      return `
        <button
          type="button"
          class="popup"
          data-reserva-id="${escapeHtmlAttribute(reservationId)}"
          data-placement="${placement}"
          data-title="${escapeHtmlAttribute(title)}"
          data-content="${escapeHtmlAttribute(bodyHtml)}"
        >
          <span class="${iconClass}" aria-hidden="true"></span>
          <span class="sr-only">${escapeHtmlAttribute(
            this.i18n.labels.details
          )}</span>
        </button>
      `;
    }

    _getDefaultPopoverContent(reservation) {
      const startDate =
        reservation.fechaDesde instanceof Date ? reservation.fechaDesde : null;
      const endDate =
        reservation.fechaHasta instanceof Date ? reservation.fechaHasta : null;

      const fmt = (d) => {
        if (!d) {
          return "";
        }
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yy = d.getFullYear();
        return `${dd}/${mm}/${yy}`;
      };

      const confirmed =
        reservation.confirmado === 0
          ? this.i18n.popover.no
          : this.i18n.popover.yes;
      const active =
        reservation.activo === 0 ? this.i18n.popover.no : this.i18n.popover.yes;

      return `
        <div class="popover-content">
          <div><strong>${escapeHtmlAttribute(
            this.i18n.popover.client
          )}:</strong> ${(reservation.clienteNombre || "")
        .toString()
        .trim()} ${(reservation.clienteApellido || "").toString().trim()}</div>
          <div><strong>${escapeHtmlAttribute(
            this.i18n.popover.from
          )}:</strong> ${fmt(startDate)}</div>
          <div><strong>${escapeHtmlAttribute(
            this.i18n.popover.to
          )}:</strong> ${fmt(endDate)}</div>
          <div><strong>${escapeHtmlAttribute(
            this.i18n.popover.confirmed
          )}:</strong> ${escapeHtmlAttribute(confirmed)}</div>
          <div><strong>${escapeHtmlAttribute(
            this.i18n.popover.active
          )}:</strong> ${escapeHtmlAttribute(active)}</div>
        </div>
      `.trim();
    }

    _getOccupancyPercent(resourceCount) {
      if (!resourceCount) {
        return "0.00%";
      }

      const totalAvailableDays =
        this._daysInMonth * resourceCount - this._inactiveDaysTotal;

      if (!totalAvailableDays) {
        return "0.00%";
      }

      const occupancyPercent =
        (this._reservedDaysTotal * 100) / totalAvailableDays;

      return `${occupancyPercent.toFixed(2)}%`;
    }

    _setupEvents() {
      this.container.addEventListener("click", this._boundOnClick);
      this.container.addEventListener("change", this._boundOnChange);
      document.addEventListener("click", this._boundOnDocumentClick);
      window.addEventListener("scroll", this._boundOnScroll, { passive: true });

      const head = this.container.querySelector("thead");
      this._headTop = head
        ? head.getBoundingClientRect().top + window.scrollY
        : 0;
      this._isFixed = false;
    }

    _teardownEvents() {
      this.container.removeEventListener("click", this._boundOnClick);
      this.container.removeEventListener("change", this._boundOnChange);
      document.removeEventListener("click", this._boundOnDocumentClick);
      window.removeEventListener("scroll", this._boundOnScroll);
    }

    _onChange(e) {
      const target = e.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (!target.classList.contains("calendar")) {
        return;
      }

      const yearEl = this.container.querySelector(".drop_year");
      const mesEl = this.container.querySelector(".drop_mes");
      const year = yearEl ? Number(yearEl.value) : this.options.year;
      const mes = mesEl ? Number(mesEl.value) : this.options.mes;

      this.render({
        mes,
        year,
        jsonData: this.options.jsonData,
        idRecurso: this.options.idRecurso,
      });
    }

    _onClick(e) {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) {
        return;
      }

      const actionEl = target.closest("[data-action]");
      if (actionEl) {
        e.preventDefault();

        const action = actionEl.getAttribute("data-action");
        if (action === "next") {
          this._goNext();
          return;
        }

        if (action === "prev") {
          this._goPrev();
          return;
        }
      }

      const popupBtn = target.closest(".popup");
      if (popupBtn) {
        e.preventDefault();

        const reservaId = popupBtn.getAttribute("data-reserva-id");
        if (typeof this.options.onReservationClick === "function") {
          this.options.onReservationClick({
            reservaId,
            anchorEl: popupBtn,
            anchorRect: popupBtn.getBoundingClientRect(),
            mes: this.options.mes,
            year: this.options.year,
          });
        }

        if (this.options.disableInternalPopover) {
          return;
        }

        this._togglePopover(popupBtn);
        return;
      }

      const availableCell = target.closest("td.disponible");
      if (availableCell) {
        const fecha = availableCell.getAttribute("data-fecha");
        if (fecha) {
          const [diaStr, mesStr, yearStr] = fecha.split("/");
          const dia = Number(diaStr);
          const mes = Number(mesStr);
          const year = Number(yearStr);
          const idRecurso = availableCell.getAttribute("data-recurso");

          if (
            typeof this.options.onAvailableDayClick === "function" &&
            Number.isFinite(dia) &&
            Number.isFinite(mes) &&
            Number.isFinite(year)
          ) {
            this.options.onAvailableDayClick({
              dia,
              mes,
              year,
              idRecurso,
              cellEl: availableCell,
              cellRect: availableCell.getBoundingClientRect(),
            });
          }
        }

        return;
      }

      if (target.closest(".calendar-popover-close")) {
        e.preventDefault();
        this._closePopover();
        return;
      }

      if (this._popover && !target.closest(".calendar-popover")) {
        this._closePopover();
      }
    }

    _onDocumentClick(e) {
      if (!this._popover) {
        return;
      }

      const target = e.target instanceof Element ? e.target : null;
      if (!target) {
        return;
      }

      if (target.closest(".calendar-popover-close")) {
        e.preventDefault();
        this._closePopover();
        return;
      }

      if (target.closest(".calendar-popover")) {
        return;
      }

      if (
        this._openPopoverEl &&
        target.closest(".popup") === this._openPopoverEl
      ) {
        return;
      }

      if (this.container.contains(target)) {
        return;
      }

      this._closePopover();
    }

    _goNext() {
      let year;
      if (this.options.mes === 12) {
        year =
          this.options.year < this.options.hastaYear
            ? this.options.year + 1
            : this.options.desdeYear;
      } else {
        year = this.options.year;
      }

      this.render({
        mes: this.options.mes === 12 ? 1 : this.options.mes + 1,
        year,
        jsonData: this.options.jsonData,
        idRecurso: this.options.idRecurso,
      });
    }

    _goPrev() {
      let year;
      if (this.options.mes === 1) {
        year =
          this.options.year > this.options.desdeYear
            ? this.options.year - 1
            : this.options.hastaYear;
      } else {
        year = this.options.year;
      }

      this.render({
        mes: this.options.mes === 1 ? 12 : this.options.mes - 1,
        year,
        jsonData: this.options.jsonData,
        idRecurso: this.options.idRecurso,
      });
    }

    _onScroll() {
      const head = this.container.querySelector("thead");
      const tbody = this.container.querySelector("tbody");

      if (!head || !tbody) {
        return;
      }

      const tbodyHeight = tbody.getBoundingClientRect().height;
      const theadHeight = head.getBoundingClientRect().height;
      const scrollTop = window.scrollY;

      const headRect = head.getBoundingClientRect();
      const headTopCurrent =
        headRect.top + window.scrollY - this.options.topOffset;

      if (!this._isFixed && this._headTop !== headTopCurrent) {
        this._headTop = headTopCurrent;
      }

      if (
        scrollTop + this.options.topOffset + theadHeight >
        tbodyHeight + this._headTop
      ) {
        this._isFixed = false;
        head.classList.remove("header-fixed");
      } else if (scrollTop >= this._headTop && !this._isFixed) {
        this._isFixed = true;
        this._syncColumnWidths();
        head.classList.add("header-fixed");
      } else if (scrollTop <= this._headTop && this._isFixed) {
        this._isFixed = false;
        head.classList.remove("header-fixed");
      }
    }

    _syncColumnWidths() {
      const table = this.container.querySelector("table");
      if (!table) {
        return;
      }

      const headThs = table.querySelectorAll("thead tr:first-child th");
      const firstRowTds = table.querySelectorAll("tbody tr:first-child td");

      headThs.forEach((th) => {
        th.style.width = "";
      });

      firstRowTds.forEach((td) => {
        td.style.width = "";
      });

      firstRowTds.forEach((td, i) => {
        const w = td.getBoundingClientRect().width;

        td.style.width = `${w}px`;

        const headIndex = i + 1;
        const th = table.querySelector(
          `thead tr:first-child th:nth-child(${headIndex + 1})`
        );
        if (th) {
          th.style.width = `${w}px`;
        }
      });
    }

    _togglePopover(btn) {
      if (this._openPopoverEl === btn && this._popover) {
        this._closePopover();
        return;
      }

      this._openPopover(btn);
    }

    _openPopover(btn) {
      this._closePopover();

      const title = btn.getAttribute("data-title") || "";
      const content = btn.getAttribute("data-content") || "";
      const placement = btn.getAttribute("data-placement") || "right";

      const popover = document.createElement("div");
      popover.className = `calendar-popover calendar-popover-${placement}`;
      popover.innerHTML = `
        <div class="calendar-popover-header">
          <div class="calendar-popover-title">${title}</div>
          <button type="button" class="calendar-popover-close" aria-label="${escapeHtmlAttribute(
            this.i18n.labels.close
          )}">×</button>
        </div>
        <div class="calendar-popover-body">${content}</div>
      `;

      document.body.appendChild(popover);

      const rect = btn.getBoundingClientRect();
      const popRect = popover.getBoundingClientRect();
      const gap = 10;

      let top =
        rect.top + window.scrollY + rect.height / 2 - popRect.height / 2;
      let left;

      if (placement === "left") {
        left = rect.left + window.scrollX - popRect.width - gap;
      } else {
        left = rect.right + window.scrollX + gap;
      }

      top = Math.max(window.scrollY + 10, top);
      left = Math.max(window.scrollX + 10, left);

      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;

      this._popover = popover;
      this._openPopoverEl = btn;
    }

    _closePopover() {
      if (this._popover) {
        this._popover.remove();
      }

      this._popover = null;
      this._openPopoverEl = null;
    }
  }

  window.VanillaCalendar = VanillaCalendar;
  window.CalendarioVanilla = VanillaCalendar;
})();
