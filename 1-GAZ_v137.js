(function ($) {
    Drupal.behaviors.be1 = {
        attach: function (context, settings) {
            // Scrie doar numere
            jQuery("table").on(
                "keypress",
                "input.float, input.numeric",
                function (event) {
                    if (isNumberPressed(this, event) === false) {
                        event.preventDefault();
                    }
                }
            );
        },
    };

    const startIndexes = {
        CAP1: 5,
        CAP2: 5,
        CAP3: 5,
        CAP4: 12,
    };

    function renumeroteazaTabele() {
        Object.entries(startIndexes).forEach(([cap, start]) => {
            const inputs = $("input." + cap + "-custom-row-index");
            inputs.each(function (i) {
                $(this).val(start + i);
            });
        });
    }

    function calcCap4Total() {
        let total = new Decimal(0);

        // === Rânduri statice ===
        const staticSelectors = [
            "input[field='CAP4_R2_C10']",
            "input[field='CAP4_R3_C11']",
            "input[field='CAP4_R4_C42']",
            "input[field='CAP4_R5_C43']",
            "input[field='CAP4_R6_C44']",
            "input[field='CAP4_R7_C45']",
            "input[field='CAP4_R8_C46']",
            "input[field='CAP4_R9_C47']",
        ];

        staticSelectors.forEach((selector) => {
            const val = $(selector).val();
            if (val && !isNaN(val)) {
                total = total.plus(new Decimal(val));
            }
        });

        // Rânduri dinamice doar dacă CA == "F4100", "H4900"...
        const coduriPermisecalcCap4 = ["F4100", "H4900"];
        $("tr.CAP4-row").each(function () {
            const selectVal = $(this).find("select[field='CAP4_R_CA']").val();
            const inputVal = $(this).find("input[field='CAP4_R_C01']").val();
            if (
                coduriPermisecalcCap4.includes(selectVal) &&
                inputVal &&
                !isNaN(inputVal)
            ) {
                total = total.plus(new Decimal(inputVal));
            }
        });

        const target = $("input[field='CAP4_R1_C00']");
        if (target.length) {
            if (!total.isZero()) {
                target.val(total.toNumber());
            } else {
                target.val("");
            }
        }
    }

    function calcIndustrieTotal() {
        let total = new Decimal(0);
        const coduriInterziseIndustrie = ["F4100", "H4900"];

        $("tr.CAP4-row").each(function () {
            const select = $(this).find("select[field='CAP4_R_CA']");
            const cod = select.val()?.trim();
            const val = $(this).find("input[field='CAP4_R_C01']").val();

            // Dacă codul este gol sau este în lista interzisă, îl sărim
            if (!cod || coduriInterziseIndustrie.includes(cod)) return;

            if (val && !isNaN(val)) {
                total = total.plus(new Decimal(val));
            }
        });

        const target = $("input[field='CAP4_R3_C11']");
        if (target.length) {
            if (!total.isZero()) {
                target.val(total.toNumber());
            } else {
                target.val("");
            }
        }
    }

    // MODIFICARE AICI: Am inversat ordinea funcțiilor de calcul
    webform.afterLoad.gaz1 = function () {
        renumeroteazaTabele();
        // Se calculează întâi sub-totalul pentru industrie
        calcIndustrieTotal();
        // Apoi se calculează totalul general care include și sub-totalul industriei
        calcCap4Total();

        $('[class$="-grid-addrow"]').on("click", function () {
            setTimeout(() => {
                renumeroteazaTabele();
                calcIndustrieTotal();
                calcCap4Total();
            }, 100);
        });

        $(document).on(
            "input",
            "input[field^='CAP4_R'][field$='C10'], input[field$='C11'], input[field$='C42'], input[field$='C43'], input[field$='C44'], input[field$='C45'], input[field$='C46'], input[field$='C47'], input[name^='CAP4_R_C01']",
            function () {
                calcIndustrieTotal();
                calcCap4Total();
            }
        );

        $(document).on("input", "input[field='CAP4_R_C01']", function () {
            calcIndustrieTotal();
            calcCap4Total();
        });

        $(document).on("change", "select[field='CAP4_R_CA']", function () {
            calcIndustrieTotal();
            calcCap4Total();
        });

        const cap4Table = document.querySelector("#tab_cap4 tbody");
        if (cap4Table) {
            const observer = new MutationObserver(() => {
                calcIndustrieTotal();
                calcCap4Total();
            });

            observer.observe(cap4Table, {
                childList: true,
                subtree: false,
            });
        }

        // Stergem primul rand cu textul "TOTAL" pentru mai multe selecturi
        // if (!Drupal.settings.mywebform.preview) {
        //   jQuery(
        //     "select[field='CAP1_R_CA'], select[field='CAP2_R_CA'], select[field='CAP3_R_CA']"
        //   ).each(function () {
        //     // 'this' se referă la fiecare element <select> în parte
        //     var villages = jQuery(this).myWebformSelect2GetOptions();

        //     villages.forEach(function (village, index) {
        //       if (village.id == "0000000") {
        //         villages.splice(index, 1);
        //         return;
        //       }
        //     });
        //   });
        // }
    };

    webform.validators.gaz1 = function () {
        var values = Drupal.settings.mywebform.values;
        var errors = webform.errors;

        // Definim listele de coduri o singură dată la începutul funcției
        const cityCodes = [
            "101000",
            "111000",
            "121000",
            "122000",
            "131000",
            "141000",
            "151000",
            "154000",
            "301000",
            "1001000",
            "1201000",
            "1401000",
            "1402000",
            "2101000",
            "2501000",
            "2701000",
            "2702000",
            "2901000",
            "3101000",
            "3401000",
            "3601000",
            "4101000",
            "4102000",
            "4301000",
            "4501000",
            "4502000",
            "4503000",
            "4801000",
            "5301000",
            "5501000",
            "5701000",
            "5702000",
            "6001000",
            "6201000",
            "6202000",
            "6203000",
            "6401000",
            "6701000",
            "7101000",
            "7102000",
            "7401000",
            "7402000",
            "7801000",
            "8001000",
            "8002000",
            "8301000",
            "8501000",
            "8701000",
            "8702000",
            "8901000",
            "9201000",
            "9202000",
            "9602000",
            "9603000",
            "9802000",
            "9803000",
            "9804000",
            "9805000",
            "9806000",
            "9807000",
            "9808000",
            "9809000",
            "9810000",
        ];

        const districtCodes = [
            "0100000",
            "0300000",
            "0501000",
            "1000000",
            "1200000",
            "1400000",
            "1700000",
            "1701000",
            "2100000",
            "2500000",
            "2700000",
            "2900000",
            "3100000",
            "3400000",
            "3600000",
            "3800000",
            "4100000",
            "4300000",
            "4500000",
            "4800000",
            "5300000",
            "5500000",
            "5700000",
            "6000000",
            "6200000",
            "6400000",
            "6700000",
            "7100000",
            "7400000",
            "7800000",
            "8000000",
            "8300000",
            "8500000",
            "8700000",
            "8900000",
            "9200000",
            "9601000",
            "9801000",
        ];

        //====================================================================================================
        // VALIDARE: Cap.1 Rând 02 (Total orașe) = Suma rândurilor CUATM care sunt orașe
        //====================================================================================================
        for (let c = 1; c <= 6; c++) {
            const r02Value = new Decimal(values[`CAP1_R2_C0${c}`] || 0);
            let sumaOrase = new Decimal(0);

            if (values.CAP1_R_CA && values.CAP1_R_CA.length) {
                for (let i = 0; i < values.CAP1_R_CA.length; i++) {
                    const cuatmCode = values.CAP1_R_CA[i];
                    // Verificăm dacă codul CUATM este în lista de orașe
                    if (cityCodes.includes(cuatmCode)) {
                        const rowValue = new Decimal(values[`CAP1_R_C0${c}`]?.[i] || 0);
                        sumaOrase = sumaOrase.plus(rowValue);
                    }
                }
            }

            if (!r02Value.equals(sumaOrase)) {
                errors.push({
                    fieldName: `CAP1_R2_C0${c}`,
                    msg: `Cap.1, Col. ${c}: Rândul 02 (${r02Value}) = Suma Rind.CUATM pe toate oraşele (${sumaOrase}).`,
                });
            }
        }

        //====================================================================================================
        // VALIDARE: Cap.1 Rând 03 (Total raioane/municipii) = Suma rândurilor CUATM corespunzătoare
        //====================================================================================================
        for (let c = 1; c <= 6; c++) {
            const r03Value = new Decimal(values[`CAP1_R3_C0${c}`] || 0);
            let sumaRaioane = new Decimal(0);

            if (values.CAP1_R_CA && values.CAP1_R_CA.length) {
                for (let i = 0; i < values.CAP1_R_CA.length; i++) {
                    const cuatmCode = values.CAP1_R_CA[i];
                    // Verificăm dacă codul CUATM este în lista de raioane/municipii
                    if (districtCodes.includes(cuatmCode)) {
                        const rowValue = new Decimal(values[`CAP1_R_C0${c}`]?.[i] || 0);
                        sumaRaioane = sumaRaioane.plus(rowValue);
                    }
                }
            }

            if (!r03Value.equals(sumaRaioane)) {
                errors.push({
                    fieldName: `CAP1_R3_C0${c}`,
                    msg: `Cap.1, Col. ${c}: Rândul 03 (${r03Value}) = Suma Rind.CUATM pe toate localităţile rurale (${sumaRaioane}).`,
                });
            }
        }

        //====================================================================================================
        // VALIDARE: Cap.2 Rând 02 (Total orașe) = Suma rândurilor CUATM care sunt orașe
        //====================================================================================================
        for (let c = 1; c <= 8; c++) {
            // Itare prin 8 coloane pentru Cap. 2
            const r02Value = new Decimal(values[`CAP2_R2_C0${c}`] || 0);
            let sumaOrase = new Decimal(0);

            if (values.CAP2_R_CA && values.CAP2_R_CA.length) {
                for (let i = 0; i < values.CAP2_R_CA.length; i++) {
                    const cuatmCode = values.CAP2_R_CA[i];
                    // Folosim aceeași listă 'cityCodes'
                    if (cityCodes.includes(cuatmCode)) {
                        const rowValue = new Decimal(values[`CAP2_R_C0${c}`]?.[i] || 0);
                        sumaOrase = sumaOrase.plus(rowValue);
                    }
                }
            }

            if (!r02Value.equals(sumaOrase)) {
                errors.push({
                    fieldName: `CAP2_R2_C0${c}`,
                    msg: `Cap.2, Col. ${c}: Valoarea din rândul 02 (${r02Value}) nu corespunde cu suma rândurilor CUATM pentru orașe (${sumaOrase}).`,
                });
            }
        }

        //====================================================================================================
        // VALIDARE: Cap.2 Rând 03 (Total raioane/municipii) = Suma rândurilor CUATM corespunzătoare
        //====================================================================================================
        for (let c = 1; c <= 8; c++) {
            // Itare prin 8 coloane pentru Cap. 2
            const r03Value = new Decimal(values[`CAP2_R3_C0${c}`] || 0);
            let sumaRaioane = new Decimal(0);

            if (values.CAP2_R_CA && values.CAP2_R_CA.length) {
                for (let i = 0; i < values.CAP2_R_CA.length; i++) {
                    const cuatmCode = values.CAP2_R_CA[i];
                    // Folosim aceeași listă 'districtCodes'
                    if (districtCodes.includes(cuatmCode)) {
                        const rowValue = new Decimal(values[`CAP2_R_C0${c}`]?.[i] || 0);
                        sumaRaioane = sumaRaioane.plus(rowValue);
                    }
                }
            }

            if (!r03Value.equals(sumaRaioane)) {
                errors.push({
                    fieldName: `CAP2_R3_C0${c}`,
                    msg: `Cap.2, Col. ${c}: Valoarea din rândul 03 (${r03Value}) nu corespunde cu suma rândurilor CUATM pentru raioane și municipii (${sumaRaioane}).`,
                });
            }
        }


        //====================================================================================================
        // VALIDARE: Cap.3 Rând 02 (Total orașe) = Suma rândurilor CUATM care sunt orașe
        //====================================================================================================
        for (let c = 1; c <= 4; c++) { // Itare prin 4 coloane pentru Cap. 3
            const r02Value = new Decimal(values[`CAP3_R2_C0${c}`] || 0);
            let sumaOrase = new Decimal(0);

            if (values.CAP3_R_CA && values.CAP3_R_CA.length) {
                for (let i = 0; i < values.CAP3_R_CA.length; i++) {
                    const cuatmCode = values.CAP3_R_CA[i];
                    // Folosim aceeași listă 'cityCodes'
                    if (cityCodes.includes(cuatmCode)) {
                        const rowValue = new Decimal(values[`CAP3_R_C0${c}`]?.[i] || 0);
                        sumaOrase = sumaOrase.plus(rowValue);
                    }
                }
            }

            if (!r02Value.equals(sumaOrase)) {
                errors.push({
                    fieldName: `CAP3_R2_C0${c}`,
                    msg: `Cap.3, Col. ${c}: Valoarea din rândul 02 (${r02Value}) nu corespunde cu suma rândurilor CUATM pentru orașe (${sumaOrase}).`
                });
            }
        }

        //====================================================================================================
        // VALIDARE: Cap.3 Rând 03 (Total raioane/municipii) = Suma rândurilor CUATM corespunzătoare
        //====================================================================================================
        for (let c = 1; c <= 4; c++) { // Itare prin 4 coloane pentru Cap. 3
            const r03Value = new Decimal(values[`CAP3_R3_C0${c}`] || 0);
            let sumaRaioane = new Decimal(0);

            if (values.CAP3_R_CA && values.CAP3_R_CA.length) {
                for (let i = 0; i < values.CAP3_R_CA.length; i++) {
                    const cuatmCode = values.CAP3_R_CA[i];
                    // Folosim aceeași listă 'districtCodes'
                    if (districtCodes.includes(cuatmCode)) {
                        const rowValue = new Decimal(values[`CAP3_R_C0${c}`]?.[i] || 0);
                        sumaRaioane = sumaRaioane.plus(rowValue);
                    }
                }
            }

            if (!r03Value.equals(sumaRaioane)) {
                errors.push({
                    fieldName: `CAP3_R3_C0${c}`,
                    msg: `Cap.3, Col. ${c}: Valoarea din rândul 03 (${r03Value}) nu corespunde cu suma rândurilor CUATM pentru raioane și municipii (${sumaRaioane}).`
                });
            }
        }


        // CAP1 Col. 3 <= col 2 pentru fiecare rînd
        // Rânduri statice
        for (var r = 1; r <= 4; r++) {
            var col2 = new Decimal(values[`CAP1_R${r}_C02`] || 0);
            var col3 = new Decimal(values[`CAP1_R${r}_C03`] || 0);

            if (
                values[`CAP1_R${r}_C02`] &&
                values[`CAP1_R${r}_C03`] &&
                col3.gt(col2)
            ) {
                webform.errors.push({
                    fieldName: `CAP1_R${r}_C03`,
                    msg: ` [01-003]. Rîndul ${r}: Coloana 3 (${col3}) <= coloana 2 (${col2}).`,
                });
            }
        }

        // Rânduri dinamice
        for (var i = 0; i < values.CAP1_R_C02.length; i++) {
            var c2 = new Decimal(values.CAP1_R_C02[i] || 0);
            var c3 = new Decimal(values.CAP1_R_C03[i] || 0);

            if (!values.CAP1_R_C02[i] || !values.CAP1_R_C03[i]) continue;

            if (c3.gt(c2)) {
                webform.errors.push({
                    fieldName: "CAP1_R_C03",
                    index: i,
                    msg: ` [01-003]. Rînd CUATM ${i + 1
                        }: Coloana 3 (${c3}) <= coloana 2 (${c2}).`,
                });
            }
        }

        // Verificare daca o coloana dinamica e completata, atunci SELECTORUL e obligatoriu CAP1
        for (let i = 0; i < (values.CAP1_R_C01?.length || 0); i++) {
            // Verificăm toate coloanele 1–6
            const col1 = parseFloat(values.CAP1_R_C01?.[i]) || 0;
            const col2 = parseFloat(values.CAP1_R_C02?.[i]) || 0;
            const col3 = parseFloat(values.CAP1_R_C03?.[i]) || 0;
            const col4 = parseFloat(values.CAP1_R_C04?.[i]) || 0;
            const col5 = parseFloat(values.CAP1_R_C05?.[i]) || 0;
            const col6 = parseFloat(values.CAP1_R_C06?.[i]) || 0;

            // Obținem valoarea selectului
            const selectVal = values.CAP1_R_CA?.[i]?.trim();

            // Dacă oricare coloană 1–6 este completată (> 0), dar selectul e gol
            if (
                (col1 > 0 ||
                    col2 > 0 ||
                    col3 > 0 ||
                    col4 > 0 ||
                    col5 > 0 ||
                    col6 > 0) &&
                (!selectVal || selectVal === "")
            ) {
                errors.push({
                    weight: 22,
                    index: i,
                    msg: `Cap.1 Rînd CUATM ${i + 1
                        }: Dacă una dintre coloanele 1-6 este completată, rîndul CUATM trebuie să fie selectat.`,
                });
                // Adăugăm bordură roșie pe select
                jQuery(`#CAP1_R_CA-${i}`).addClass("error").css("border-color", "red");
            } else {
                // Eliminăm bordura roșie dacă nu mai este eroare
                jQuery(`#CAP1_R_CA-${i}`).removeClass("error").css("border-color", "");
            }
        }

        // CAP1 Col. 5 <= col.4 pentru fiecare rînd
        // Rânduri statice (R1 până la R4)
        for (var r = 1; r <= 4; r++) {
            var col4 = new Decimal(values[`CAP1_R${r}_C04`] || 0);
            var col5 = new Decimal(values[`CAP1_R${r}_C05`] || 0);

            if (
                values[`CAP1_R${r}_C04`] &&
                values[`CAP1_R${r}_C05`] &&
                col5.gt(col4)
            ) {
                webform.errors.push({
                    fieldName: `CAP1_R${r}_C05`,
                    msg: Drupal.t(
                        `[01-004]. Rîndul ${r}: Coloana 5 (${col5}) <= coloana 4 (${col4}).`
                    ),
                });
            }
        }

        // Rânduri dinamice
        for (var i = 0; i < values.CAP1_R_C04.length; i++) {
            var c4 = new Decimal(values.CAP1_R_C04[i] || 0);
            var c5 = new Decimal(values.CAP1_R_C05[i] || 0);

            if (!values.CAP1_R_C04[i] || !values.CAP1_R_C05[i]) continue;

            if (c5.gt(c4)) {
                webform.errors.push({
                    fieldName: "CAP1_R_C05",
                    index: i,
                    msg: Drupal.t(
                        `[01-004]. Rînd CUATM ${i + 1
                        }: Coloana 5 (${c5}) <= coloana 4 (${c4}).`
                    ),
                });
            }
        }

        // CAP1 Rînd.01= rînd 02 + rînd 03 pentru toate coloniţele
        for (var c = 1; c <= 6; c++) {
            var total = new Decimal(values["CAP1_R1_C0" + c] || 0);
            var r2 = new Decimal(values["CAP1_R2_C0" + c] || 0);
            var r3 = new Decimal(values["CAP1_R3_C0" + c] || 0);
            var sum = r2.plus(r3);

            if (!total.equals(sum)) {
                webform.errors.push({
                    fieldName: "CAP1_R1_C0" + c,
                    msg: Drupal.t(
                        ` [01-005]. Rînd 01, coloana ${c}: Valoarea (${total}) = Rînd 02 (${r2}) + Rînd 03 (${r3}).`
                    ),
                });
            }
        }

        // CAP1 Col.6 = Col.1 + Col.2 - Col.4 pentru fiecare rînd static
        for (var r = 1; r <= 4; r++) {
            var col1 = new Decimal(values[`CAP1_R${r}_C01`] || 0);
            var col2 = new Decimal(values[`CAP1_R${r}_C02`] || 0);
            var col4 = new Decimal(values[`CAP1_R${r}_C04`] || 0);
            var col6 = new Decimal(values[`CAP1_R${r}_C06`] || 0);
            var expected = col1.plus(col2).minus(col4);

            if (
                values[`CAP1_R${r}_C06`] && // dacă e completat
                !col6.equals(expected) // și diferă
            ) {
                webform.errors.push({
                    fieldName: `CAP1_R${r}_C06`,
                    msg: Drupal.t(
                        `[01-001]. Rîndul ${r}, Col.6 = Col.1 + Col.2 - Col.4. Așteptat: (${col1} + ${col2} - ${col4}) = ${expected}, introdus: ${col6}`
                    ),
                });
            }
        }

        // CAP1 [Col.6] = [Col.1+2-4] (pe toate rinduri)
        for (let i = 0; i < values.CAP1_R_C06?.length || 0; i++) {
            const col1 = new Decimal(values.CAP1_R_C01[i] || 0);
            const col2 = new Decimal(values.CAP1_R_C02[i] || 0);
            const col4 = new Decimal(values.CAP1_R_C04[i] || 0);
            const col6 = new Decimal(values.CAP1_R_C06[i] || 0);

            const expected = col1.plus(col2).minus(col4);
            const rowLabel = values.CAP1_R_CB?.[i] || i + 1;

            if (!col6.equals(expected)) {
                errors.push({
                    weight: 15,
                    index: i,
                    fieldName: "CAP1_R_C06[" + i + "]",
                    msg:
                        " [01-001] Cap.1: [Col.6] = [Col.1+2-4] în rîndul [" +
                        rowLabel +
                        "]. Valori: (" +
                        col1 +
                        " + " +
                        col2 +
                        " - " +
                        col4 +
                        ") = " +
                        expected.toFixed(2) +
                        ", introdus: " +
                        col6,
                });
            }
        }

        // Verificare daca o coloana dinamica e completata, atunci SELECTORUL e obligatoriu CAP2
        for (let i = 0; i < (values.CAP2_R_C01?.length || 0); i++) {
            const col1 = parseFloat(values.CAP2_R_C01?.[i]) || 0;
            const col2 = parseFloat(values.CAP2_R_C02?.[i]) || 0;
            const col3 = parseFloat(values.CAP2_R_C03?.[i]) || 0;
            const col4 = parseFloat(values.CAP2_R_C04?.[i]) || 0;
            const col5 = parseFloat(values.CAP2_R_C05?.[i]) || 0;
            const col6 = parseFloat(values.CAP2_R_C06?.[i]) || 0;
            const col7 = parseFloat(values.CAP2_R_C07?.[i]) || 0;
            const col8 = parseFloat(values.CAP2_R_C08?.[i]) || 0;

            const selectVal = values.CAP2_R_CA?.[i]?.trim();

            // Dacă oricare coloană 1–8 este completată (> 0), dar selectul e gol
            if (
                (col1 > 0 ||
                    col2 > 0 ||
                    col3 > 0 ||
                    col4 > 0 ||
                    col5 > 0 ||
                    col6 > 0 ||
                    col7 > 0 ||
                    col8 > 0) &&
                (!selectVal || selectVal === "")
            ) {
                errors.push({
                    weight: 22,
                    index: i,
                    msg: `Cap.2 Rînd CUATM ${i + 1
                        }: Dacă una dintre coloanele 1-8 este completată, rîndul CUATM trebuie să fie selectat.`,
                });
                // Adaugăm border roșu pe select
                jQuery(`#CAP2_R_CA-${i}`).addClass("error").css("border-color", "red");
            } else {
                // Eliminăm border roșu dacă nu mai este eroare
                jQuery(`#CAP2_R_CA-${i}`).removeClass("error").css("border-color", "");
            }
        }

        // CAP2 Col. 3 +col. 4<= col. 2 pentru fiecare rînd
        // Rânduri statice (1–4)
        for (let r = 1; r <= 4; r++) {
            const c2 = new Decimal(values[`CAP2_R${r}_C02`] || 0);
            const c3 = new Decimal(values[`CAP2_R${r}_C03`] || 0);
            const c4 = new Decimal(values[`CAP2_R${r}_C04`] || 0);

            if (c3.plus(c4).gt(c2)) {
                webform.errors.push({
                    fieldName: `CAP2_R${r}_C02`,
                    msg: Drupal.t(` [02-003]. Rîndul ${r}, C03 + C04 ≤ C02.`),
                });
            }
        }

        // Rânduri dinamice
        for (let i = 0; i < values.CAP2_R_C02.length; i++) {
            const c2 = new Decimal(values.CAP2_R_C02[i] || 0);
            const c3 = new Decimal(values.CAP2_R_C03[i] || 0);
            const c4 = new Decimal(values.CAP2_R_C04[i] || 0);

            if (c3.plus(c4).gt(c2)) {
                webform.errors.push({
                    fieldName: "CAP2_R_C02",
                    index: i,
                    msg: `[02-003]. C03 + C04 ≤ C02 (rînd CUATM) (${c3}) + (${c4}) ≤ (${c2}).`,
                });
            }
        }

        // CAP2 Col. 6 +col. 7<= col.5 pentru fiecare rînd
        // Rânduri statice (1–4)
        for (let r = 1; r <= 4; r++) {
            const c5 = new Decimal(values[`CAP2_R${r}_C05`] || 0);
            const c6 = new Decimal(values[`CAP2_R${r}_C06`] || 0);
            const c7 = new Decimal(values[`CAP2_R${r}_C07`] || 0);

            if (c6.plus(c7).gt(c5)) {
                webform.errors.push({
                    fieldName: `CAP2_R${r}_C05`,
                    msg: Drupal.t(
                        ` [02-004]. La rîndul ${r}, C06 + C07 = ≤ C05 (${c6}) + (${c7}) ≤ (${c5})`
                    ),
                });
            }
        }

        // Rânduri dinamice
        for (let i = 0; i < values.CAP2_R_C05.length; i++) {
            const c5 = new Decimal(values.CAP2_R_C05[i] || 0);
            const c6 = new Decimal(values.CAP2_R_C06[i] || 0);
            const c7 = new Decimal(values.CAP2_R_C07[i] || 0);

            if (c6.plus(c7).gt(c5)) {
                webform.errors.push({
                    fieldName: "CAP2_R_C05",
                    index: i,
                    msg: Drupal.t(
                        `[02-004]. Rînd CUATM ${i + 1
                        }: C06 + C07 = ≤ C05 (${c6}) + (${c7}) ≤ (${c5}).`
                    ),
                });
            }
        }

        // CAP2 Rînd.01 = rînd 02 + rînd 03
        for (let c = 1; c <= 8; c++) {
            const r1 = new Decimal(values[`CAP2_R1_C0${c}`] || 0);
            const r2 = new Decimal(values[`CAP2_R2_C0${c}`] || 0);
            const r3 = new Decimal(values[`CAP2_R3_C0${c}`] || 0);

            const expected = r2.plus(r3);

            if (!r1.equals(expected)) {
                webform.errors.push({
                    fieldName: `CAP2_R1_C0${c}`,
                    msg: Drupal.t(
                        ` [02-005]. Coloana ${c} Rînd.01 = rînd 02 + rînd 03. Valoarea (${r1}) = (${r2}) + (${r3})`
                    ),
                });
            }
        }

        // CAP2 Col.8 = Col.1 + Col.2 - Col.5 pentru fiecare rînd static
        for (var r = 1; r <= 4; r++) {
            const col1 = new Decimal(values[`CAP2_R${r}_C01`] || 0);
            const col2 = new Decimal(values[`CAP2_R${r}_C02`] || 0);
            const col5 = new Decimal(values[`CAP2_R${r}_C05`] || 0);
            const col8 = new Decimal(values[`CAP2_R${r}_C08`] || 0);
            const expected = col1.plus(col2).minus(col5);

            if (!col8.equals(expected)) {
                webform.errors.push({
                    fieldName: `CAP2_R${r}_C08`,
                    msg: Drupal.t(
                        ` [02-001]. La rîndul ${r}, Col.8 = Col.1 + Col.2 - Col.5. Valori: (${col1} + ${col2} - ${col5}) = ${expected}, introdus: ${col8}`
                    ),
                });
            }
        }

        // CAP2 Col.8 = Col.1 + Col.2 - Col.5 pentru fiecare rînd dinamic
        for (let i = 0; i < (values.CAP2_R_C08?.length || 0); i++) {
            const col1 = new Decimal(values.CAP2_R_C01[i] || 0);
            const col2 = new Decimal(values.CAP2_R_C02[i] || 0);
            const col5 = new Decimal(values.CAP2_R_C05[i] || 0);
            const col8 = new Decimal(values.CAP2_R_C08[i] || 0);
            const expected = col1.plus(col2).minus(col5);

            if (!col8.equals(expected)) {
                webform.errors.push({
                    fieldName: "CAP2_R_C08",
                    index: i,
                    msg:
                        " [02-001]. Cap.2: [Col.8] = [Col.1 + Col.2 - Col.5] în rîndul [" +
                        (i + 1) +
                        "]. Valori: (" +
                        col1 +
                        " + " +
                        col2 +
                        " - " +
                        col5 +
                        ") = " +
                        expected.toFixed(2) +
                        ", introdus: " +
                        col8,
                });
            }
        }

        // Verificare daca o coloana dinamica e completata, atunci SELECTORUL e obligatoriu CAP3
        for (let i = 0; i < (values.CAP3_R_C01?.length || 0); i++) {
            const col1 = parseFloat(values.CAP3_R_C01?.[i]) || 0;
            const col2 = parseFloat(values.CAP3_R_C02?.[i]) || 0;
            const col3 = parseFloat(values.CAP3_R_C03?.[i]) || 0;
            const col4 = parseFloat(values.CAP3_R_C04?.[i]) || 0;

            const selectVal = values.CAP3_R_CA?.[i]?.trim();

            // Dacă oricare coloană 1–4 este completată (> 0), dar selectul e gol
            if (
                (col1 > 0 || col2 > 0 || col3 > 0 || col4 > 0) &&
                (!selectVal || selectVal === "")
            ) {
                errors.push({
                    weight: 22,
                    index: i,
                    msg: `Cap.3 Rînd CUATM ${i + 1
                        }: Dacă una dintre coloanele 1-4 este completată, selectul CUATM trebuie să fie selectat.`,
                });
                jQuery(`#CAP3_R_CA-${i}`).addClass("error").css("border-color", "red");
            } else {
                jQuery(`#CAP3_R_CA-${i}`).removeClass("error").css("border-color", "");
            }
        }

        // CAP3 Col. 2>=col 3+ col 4
        // for (let r = 1; r <= 4; r++) {
        //   const c01 = new Decimal(values[`CAP3_R${r}_C01`] || 0);
        //   const c02 = new Decimal(values[`CAP3_R${r}_C02`] || 0);
        //   const c03 = new Decimal(values[`CAP3_R${r}_C03`] || 0);

        //   if (c02.plus(c03).gt(c01)) {
        //     webform.errors.push({
        //       fieldName: `CAP3_R${r}_C01`,
        //       msg: Drupal.t(
        //         ` 09-01. La rîndul ${r}, C01 trebuie să fie ≥ C02 + C03.`
        //       ),
        //     });
        //   }
        // }

        // CAP3 Rînd. 01= rînd 02 + rînd 03 pentru toate coloniţele
        for (let c = 1; c <= 4; c++) {
            const r1 = new Decimal(values[`CAP3_R1_C0${c}`] || 0);
            const r2 = new Decimal(values[`CAP3_R2_C0${c}`] || 0);
            const r3 = new Decimal(values[`CAP3_R3_C0${c}`] || 0);

            if (!r1.equals(r2.plus(r3))) {
                webform.errors.push({
                    fieldName: `CAP3_R1_C0${c}`,
                    msg: Drupal.t(
                        ` [03-002]. Rînd 01, col. ${c}: Valoarea (${r1}) = (${r2}) + (${r3}) (Rînd 01 = Rînd 02 + Rînd 03).`
                    ),
                });
            }
        }

        // CAP3 + CAP4 Rînd. 01 col. 2 Capitolui III =rînd 00 col.1 Capitolui IV
        // var cap3Val = new Decimal(values.CAP3_R1_C02 || 0); // Capitolul III, Rînd 01, Col 2
        // var cap4Val = new Decimal(values.CAP4_R1_C00 || 0); // Capitolul IV, Rînd 00, Col 1

        // if (!cap3Val.equals(cap4Val)) {
        //   webform.errors.push({
        //     fieldName: "CAP3_R1_C02",
        //     msg: Drupal.t(
        //     `10-01. CAP.III Rînd 01 Col.2 (${cap3Val}) = CAP.IV Rînd 00 Col.1. (${cap4Val})`
        //     ),
        //   });
        // }

        // renumeroteazaTabele(); // Sigurăm numerotarea și la validare

        // Validarea calcCap4Total
        let totalCap4 = new Decimal(0);
        [
            "CAP4_R2_C10",
            "CAP4_R3_C11",
            "CAP4_R4_C42",
            "CAP4_R5_C43",
            "CAP4_R6_C44",
            "CAP4_R7_C45",
            "CAP4_R8_C46",
            "CAP4_R9_C47",
        ].forEach((field) => {
            totalCap4 = totalCap4.plus(new Decimal(values[field] || 0));
        });
        let cap4Total = new Decimal(values["CAP4_R1_C00"] || 0);
        if (!cap4Total.equals(totalCap4)) {
            errors.push({
                fieldName: "CAP4_R1_C00",
                msg: Drupal.t(
                    ` [04-001]. CAP.IV Rînd 01 Col.00 (${cap4Total}) = cu suma rîndurilor 10+11+42+43+44+45+46+47 (${totalCap4})`
                ),
            });
        }

        // Validarea calcIndustrieTotal
        let totalIndustrie = new Decimal(0);
        const coduriPermiseIndustrie = ["B0800", "B0900", "E3800", "E3900"];
        for (let i = 0; i < values.CAP4_R_CA?.length || 0; i++) {
            const cod = values.CAP4_R_CA[i]?.trim();
            const val = new Decimal(values.CAP4_R_C01[i] || 0);
            if (coduriPermiseIndustrie.includes(cod)) {
                totalIndustrie = totalIndustrie.plus(val);
            }
        }
        let cap4Industrie = new Decimal(values["CAP4_R3_C11"] || 0);
        if (!cap4Industrie.equals(totalIndustrie)) {
            errors.push({
                fieldName: "CAP4_R3_C11",
                msg: Drupal.t(
                    ` [04-002]. CAP.IV Rînd 03 Col.11 (${cap4Industrie}) = cu suma rîndurilor 12+13+…+40+41 (${totalIndustrie})`
                ),
            });
        }

        // Cap.3: Col.1 ≥ Col.2 + Col.3 (pentru toate rândurile statice și dinamice)
        for (let r = 1; r <= 4; r++) {
            // rânduri statice (R1–R4)
            const col1 = parseFloat(values[`CAP3_R${r}_C01`]) || 0;
            const col2 = parseFloat(values[`CAP3_R${r}_C02`]) || 0;
            const col3 = parseFloat(values[`CAP3_R${r}_C03`]) || 0;

            if (col1 < col2 + col3) {
                errors.push({
                    weight: 30,
                    msg: `[03-001] Cap.3 rînd ${r}: Col.1 >= Col.2 + Col.3. (${col1}) >= (${col2}) + (${col3})`,
                }); // Cap.3 Rînd ${r}: Col.1 (${col1}) trebuie să fie ≥ Col.2 + Col.3 (${ col2 + col3}).
            }
        }

        // Cap.3: Col.1 ≥ Col.2 + Col.3 (pentru rândurile dinamice)
        for (let i = 0; i < (values.CAP3_R_C01?.length || 0); i++) {
            const col1 = parseFloat(values.CAP3_R_C01?.[i]) || 0;
            const col2 = parseFloat(values.CAP3_R_C02?.[i]) || 0;
            const col3 = parseFloat(values.CAP3_R_C03?.[i]) || 0;

            if (col1 < col2 + col3) {
                errors.push({
                    weight: 31,
                    index: i,
                    msg: `[03-001] Cap.3 rînd CUATM ${i + 1
                        }: [Col.1] >= [Col.2+3] (pe toate rinduri) (${col1}) >= (${col2}) + (${col3})`,
                }); // Cap.3 Rînd dinamic ${i + 1}: Col.1 (${col1}) trebuie să fie ≥ Col.2 + Col.3 (${col2 + col3}).
            }
        }

        // Cap.1: Dacă [Rind.02 sau 03, Col.*] > 0, atunci [Rind.CUATM, Col.*] > 0
        for (let c = 1; c <= 8; c++) {
            const valR2 = parseFloat(values[`CAP1_R2_C0${c}`]) || 0;
            const valR3 = parseFloat(values[`CAP1_R3_C0${c}`]) || 0;

            if (valR2 > 0 || valR3 > 0) {
                for (let i = 0; i < (values.CAP1_R_C01?.length || 0); i++) {
                    const colVal = parseFloat(values[`CAP1_R_C0${c}`]?.[i]) || 0;
                    const caVal = values.CAP1_R_CA?.[i]?.trim();

                    if (!caVal) {
                        errors.push({
                            weight: 21,
                            index: i,
                            msg: `Cap.1 Rînd CUATM ${i + 1
                                }: Cîmpul CUATM este obligatoriu în rîndul ${i + 1}`,
                        });
                    }

                    if (colVal <= 0) {
                        errors.push({
                            weight: 20,
                            index: i,
                            msg: `Cap.1 Col.${c}: Dacă pe rîndul 2 sau 3, Col.${c} este completat (>0), atunci pe rîndul CUATM ${i + 1
                                }, Col.${c} trebuie completat.`,
                        });
                    }
                }
            }
        }

        // Cap.2: Dacă [Rind.02 sau 03, Col.*] > 0, atunci [Rind.CUATM, Col.*] > 0
        for (let c = 1; c <= 8; c++) {
            const valR2 = parseFloat(values[`CAP2_R2_C0${c}`]) || 0;
            const valR3 = parseFloat(values[`CAP2_R3_C0${c}`]) || 0;

            if (valR2 > 0 || valR3 > 0) {
                for (let i = 0; i < (values.CAP2_R_C01?.length || 0); i++) {
                    const colVal = parseFloat(values[`CAP2_R_C0${c}`]?.[i]) || 0;
                    const caVal = values.CAP2_R_CA?.[i]?.trim();

                    if (!caVal) {
                        errors.push({
                            weight: 21,
                            index: i,
                            msg: `Cap.2 Rînd CUATM ${i + 1
                                }: Cîmpul CUATM este obligatoriu în rîndul ${i + 1}`,
                        });
                    }

                    if (colVal <= 0) {
                        errors.push({
                            weight: 20,
                            index: i,
                            msg: `Cap.2 Col.${c}: Dacă pe rîndul 2 sau 3, Col.${c} este completat (>0), atunci pe rîndul CUATM ${i + 1
                                }, Col.${c} trebuie completat.`,
                        });
                    }
                }
            }
        }

        // Cap.3: Dacă [Rind.02 sau 03, Col.*] > 0, atunci [Rind.CUATM, Col.*] > 0
        for (let c = 1; c <= 4; c++) {
            const valR2 = parseFloat(values[`CAP3_R2_C0${c}`]) || 0;
            const valR3 = parseFloat(values[`CAP3_R3_C0${c}`]) || 0;

            if (valR2 > 0 || valR3 > 0) {
                for (let i = 0; i < (values.CAP3_R_C01?.length || 0); i++) {
                    const colVal = parseFloat(values[`CAP3_R_C0${c}`]?.[i]) || 0;
                    const caVal = values.CAP3_R_CA?.[i]?.trim();

                    if (!caVal) {
                        errors.push({
                            weight: 21,
                            index: i,
                            msg: `Cap.3 Rînd CUATM ${i + 1
                                }: Cîmpul CUATM este obligatoriu în rîndul ${i + 1}`,
                        });
                    }

                    if (colVal <= 0) {
                        errors.push({
                            weight: 20,
                            index: i,
                            msg: `Cap.3 Col.${c}: Dacă pe rîndul 2 sau 3, Col.${c} este completat (>0), atunci pe rîndul CUATM ${i + 1
                                }, Col.${c} trebuie completat.`,
                        });
                    }
                }
            }
        }

        // Valori din Cap.3, rînd 01, col.1, col.2, col.3
        const cap3R1C1 = parseFloat(values.CAP3_R1_C01) || 0;
        const cap3R1C2 = parseFloat(values.CAP3_R1_C02) || 0;
        const cap3R1C3 = parseFloat(values.CAP3_R1_C03) || 0;
        const cap4R0C1 = parseFloat(values.CAP4_R1_C00) || 0;

        const rezultatCalculat = cap3R1C1 - cap3R1C2 - cap3R1C3;
        const valoareIntroducere = cap4R0C1;

        if (rezultatCalculat != valoareIntroducere) {
            errors.push({
                weight: 23,
                msg:
                    "Cap.3/4: Diferența dintre Col.1 - Col.2 - Col.3 (Cap.3, rînd 01) = Cap.4 (rînd 00, Col.1).\n" +
                    "Valoare calculată: " +
                    rezultatCalculat +
                    ", introdus: " +
                    valoareIntroducere +
                    ".",
            });
        }

        webform.validatorsStatus["gaz1"] = 1;
        validateWebform();
    };
})(jQuery);
