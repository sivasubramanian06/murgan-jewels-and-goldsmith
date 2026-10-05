import { useEffect, useMemo, useState } from "react";
import {ArrowLeft,
CalendarDays, CheckCircle2,
ChevronRight,
CircleDollarSign,
Clipboard,



  Copy,



  Gem,



  Loader2,



  MessageCircle,



  PackageCheck,



  Phone,



  Ruler,



  Send,



  Sparkles,



  User,



  Weight,



} from "lucide-react";







const API_BASE_URL = import.meta.env.VITE_API_URL;







const BUSINESS_WHATSAPP = "919384741246";







const JEWELLERY_TYPES = [



  "Ring",



  "Chain",



  "Necklace",



  "Earring",



  "Bracelet",



  "Bangle",



  "Custom Design",



];







const PURITIES = [



  { value: "22K", label: "22K Gold" },



  { value: "18K", label: "18K Gold" },



];



export default function CustomOrderPage({



  setView,



  rates,



  initialJewellery,



}) {



  const normalizedInitialJewellery = JEWELLERY_TYPES.includes(initialJewellery)

    ? initialJewellery

    : "Ring";



  const [sent, setSent] = useState(false);



  const [trackId, setTrackId] = useState("");



  const [copied, setCopied] = useState(false);



  const [saving, setSaving] = useState(false);



  const [rateLoading, setRateLoading] = useState(true);



  const [rateError, setRateError] = useState("");



  const [lastOrder, setLastOrder] = useState(null);







  const [form, setForm] = useState({



    name: "",



    phone: "",



    jewellery: normalizedInitialJewellery,



    purity: "22K",



    weight: "",



    goldRate: "",



    makingCharge: "900",

wastage: "",

stoneCharge: "0",

otherCharge: "0",



    advance: "0",



    delivery: "",



    notes: "",



  });



  useEffect(() => {

    setForm((prev) => ({

      ...prev,

      jewellery: normalizedInitialJewellery,

    }));

  }, [normalizedInitialJewellery]);





  /* ==================================================



     NUMBER HELPER



  ================================================== */







  const numberValue = (value) => {



    const n = Number(value);



    return Number.isFinite(n) ? n : 0;



  };







  /* ==================================================



     MONEY FORMAT



  ================================================== */







  const money = (value) => {



    return `₹${Number(value || 0).toLocaleString("en-IN", {



      maximumFractionDigits: 2,



    })}`;



  };







  /* ==================================================



     LOAD GOLD RATE







     First use the rate received from App.jsx.



     If unavailable, use the backend as fallback.



  ================================================== */







  useEffect(() => {



    let cancelled = false;







    const applyRate = (rate) => {



      const numericRate = Number(rate);







      if (!Number.isFinite(numericRate) || numericRate <= 0) {



        setForm((prev) => ({



          ...prev,



          goldRate: "",



        }));







        setRateError(



          "Unable to load today's gold rate. Please check the backend."



        );







        setRateLoading(false);



        return;



      }







      setForm((prev) => ({



        ...prev,



        goldRate: String(numericRate),



      }));







      setRateError("");



      setRateLoading(false);



    };







    const loadGoldRate = async () => {



      setRateLoading(true);



      setRateError("");







      try {



        /*



          FIRST:



          Use the rate already loaded by App.jsx.



        */







        if (rates) {



          const rate =



            form.purity === "18K"



              ? Number(



                  rates.gold18k ??



                    rates.gold_18k_rate ??



                    0



                )



              : Number(



                  rates.gold22k ??



                    rates.gold_22k_rate ??



                    0



                );







          if (rate > 0) {



            if (!cancelled) {



              applyRate(rate);



            }







            return;



          }



        }







        /*



          FALLBACK:



          Directly request the backend.



        */







        const response = await fetch(



          `${API_BASE_URL}/api/gold-rates`



        );







        const data = await response.json();







        if (!response.ok) {



          throw new Error(



            data?.message ||



              "Gold rate request failed."



          );



        }







        const source =



          data?.data ||



          data ||



          {};







        const rate =



          form.purity === "18K"



            ? Number(



                source.gold_18k_rate ??



                  source.gold18k ??



                  source.gold18K ??



                  source.gold18KRate ??



                  0



              )



            : Number(



                source.gold_22k_rate ??



                  source.gold22k ??



                  source.gold22K ??



                  source.gold22KRate ??



                  0



              );







        if (



          !Number.isFinite(rate) ||



          rate <= 0



        ) {



          throw new Error(



            "Invalid gold rate received from database."



          );



        }







        if (!cancelled) {



          applyRate(rate);



        }



      } catch (error) {



        if (!cancelled) {



          console.error(



            "Gold rate loading error:",



            error



          );







          setRateError(



            "Unable to load today's gold rate. Please check the backend."



          );







          setForm((prev) => ({



            ...prev,



            goldRate: "",



          }));







          setRateLoading(false);



        }



      }



    };







    loadGoldRate();







    return () => {



      cancelled = true;



    };



  }, [rates, form.purity]);







  /* ==================================================



     FORM UPDATE



  ================================================== */







  const updateField = (field, value) => {



    setForm((prev) => ({



      ...prev,



      [field]: value,



    }));



  };







  /* ==================================================



     CALCULATION



  ================================================== */







  const calculation = useMemo(() => {



    const weight = numberValue(form.weight);



    const goldRate = numberValue(form.goldRate);



    const makingRate = numberValue(



      form.makingCharge



    );



    const stoneCharge = numberValue(



      form.stoneCharge



    );



    const otherCharge = numberValue(



      form.otherCharge



    );



    const advance = numberValue(



      form.advance



    );







   const goldValue =

  weight * goldRate;







    const makingAmount =

  weight * makingRate;







    const total =



      goldValue +



      makingAmount +



      stoneCharge +



      otherCharge;







    const balance = Math.max(



      total - advance,



      0



    );







    return {



      weight,



      goldRate,



      makingRate,



      stoneCharge,



      otherCharge,



      advance,



      goldValue,



      makingAmount,



      total,



      balance,



    };



  }, [form]);







  /* ==================================================



     WHATSAPP



  ================================================== */







  const openWhatsApp = (order) => {



    const phone = String(



      order.phone || ""



    ).replace(/\D/g, "");







    let whatsappPhone = phone;







    if (whatsappPhone.length === 10) {



      whatsappPhone = `91${whatsappPhone}`;



    }







    if (!whatsappPhone) {



      whatsappPhone = BUSINESS_WHATSAPP;



    }







    const message = `



Hello ${order.customer},







Thank you for choosing Sri Murugan Goldsmith and Jewels.







✨ CUSTOM JEWELLERY ORDER







Order / Tracking Code: ${order.id}







Jewellery: ${order.jewellery}



Purity: ${order.purity}



Weight: ${order.weight} g







Gold Value: ${money(order.goldValue)}



Making Charge: ${money(order.makingAmount)}

Wastage: ${order.wastage}%

Stone Charge: ${money(order.stoneCharge)}



Other Charge: ${money(order.otherCharge)}







Estimated Total: ${money(order.total)}



Advance: ${money(order.advance)}



Balance: ${money(order.balance)}







Delivery Date: ${



      order.deliveryDate ||



      "To be confirmed"



    }







Status: ${order.status}







You can use the tracking code to check your order progress.







Sri Murugan Goldsmith and Jewels



WhatsApp: 97894 81246



    `.trim();







    const url =



      `https\://wa.me/${whatsappPhone}` +



      `?text=${encodeURIComponent(message)}`;







    window.open(



      url,



      "_blank",



      "noopener,noreferrer"



    );



  };







  /* ==================================================



     CREATE CUSTOM ORDER



  ================================================== */







  const submit = async (e) => {



    e.preventDefault();







    if (saving) return;







    if (!form.name.trim()) {



      alert(



        "Please enter customer name."



      );



      return;



    }







    const normalizedPhone =



      form.phone.replace(/\D/g, "");







    if (



      normalizedPhone.length !== 10



    ) {



      alert(



        "Please enter a valid 10-digit Indian mobile number."



      );



      return;



    }







    if (!form.jewellery.trim()) {



      alert(



        "Please select jewellery type."



      );



      return;



    }







    if (calculation.weight <= 0) {



      alert(



        "Please enter the jewellery weight."



      );



      return;



    }







    if (calculation.goldRate <= 0) {



      alert(



        "Gold rate is not available. Please check today's rate."



      );



      return;



    }







    if (calculation.makingRate < 0) {



      alert(



        "Making charge cannot be negative."



      );



      return;



    }







    if (



      calculation.stoneCharge < 0 ||



      calculation.otherCharge < 0



    ) {



      alert(



        "Charges cannot be negative."



      );



      return;



    }







    if (calculation.advance < 0) {



      alert(



        "Advance cannot be negative."



      );



      return;



    }







    if (



      calculation.advance >



      calculation.total



    ) {



      const confirmAdvance =



        window.confirm(



          "The advance is greater than the estimated total. Do you want to continue?"



        );







      if (!confirmAdvance) {



        return;



      }



    }







    setSaving(true);







    try {



      const response = await fetch(



        `${API_BASE_URL}/api/orders`,



        {



          method: "POST",







          headers: {



            "Content-Type":



              "application/json",



          },







          body: JSON.stringify({



            customerName:



              form.name.trim(),







            phone:



              normalizedPhone,







            jewellery:



              form.jewellery,







            purity:



              form.purity,







            weight:



              calculation.weight,







            makingCharge: calculation.makingRate,

wastage: numberValue(form.wastage),

stoneCharge: calculation.stoneCharge,







            otherCharge:



              calculation.otherCharge,







            advance:



              calculation.advance,







            deliveryDate:



              form.delivery ||



              null,







            notes:



              form.notes.trim() ||



              null,



          }),



        }



      );







      const data =



        await response.json();







      if (



        !response.ok ||



        !data.success



      ) {



        throw new Error(



          data.message ||



            "Unable to create custom order."



        );



      }







      const saved = data.data;







      const order =



        saved.order;







      const serverCalculation =



        saved.calculation;







      const whatsappOrder = {



        id:



          order.track_code ||



          order.order_code,







        customer:



          saved.customer.name,







        phone:



          saved.customer.phone,







        jewellery:



          order.jewellery,







        purity:



          order.purity,







        weight:



          Number(



            order.weight_grams



          ),







        goldValue:



          Number(



            serverCalculation.goldValue



          ),







        makingAmount:



          Number(



            serverCalculation.makingAmount



          ),

      wastage:
        Number(order.wastage_grams || 0),







        stoneCharge:



          Number(



            order.stone_charge



          ),







        otherCharge:



          Number(



            order.other_charge



          ),







        total:



          Number(



            order.total_amount



          ),







        advance:



          Number(



            order.advance_amount



          ),







        balance:



          Number(



            order.balance_amount



          ),







        deliveryDate:



          order.delivery_date



            ? String(



                order.delivery_date



              ).slice(0, 10)



            : "",







        status:



          order.status ||



          "Order Received",







        phone:



          saved.customer.phone,



      };







      setLastOrder(



        whatsappOrder



      );







      setTrackId(



        whatsappOrder.id



      );







      setSent(true);







      setForm({



        name: "",



        phone: "",



        jewellery: "Ring",



        purity: "22K",



        weight: "",



        goldRate:



          form.goldRate,



        makingCharge: "900",



        wastage: "",


        stoneCharge: "0",



        otherCharge: "0",



        advance: "0",



        delivery: "",



        notes: "",



      });



    } catch (error) {



      console.error(



        "Custom order error:",



        error



      );







      alert(



        error.message ||



          "Unable to create order. Please try again."



      );



    } finally {



      setSaving(false);



    }



  };







  /* ==================================================



     COPY TRACKING CODE



  ================================================== */







  const copyTrackId = async () => {



    if (!trackId) return;







    try {



      await navigator.clipboard.writeText(



        trackId



      );







      setCopied(true);







      setTimeout(() => {



        setCopied(false);



      }, 1800);



    } catch {



      alert(



        "Unable to copy tracking code."



      );



    }



  };







  /* ==================================================



     START NEW ORDER



  ================================================== */







  const createAnotherOrder = () => {



    setSent(false);



    setTrackId("");



    setCopied(false);



    setLastOrder(null);







    setForm({



      name: "",



      phone: "",



      jewellery: "Ring",



      purity: "22K",



      weight: "",



      goldRate:



        form.goldRate,



      makingCharge: "900",



      wastage: "",


        stoneCharge: "0",



      otherCharge: "0",



      advance: "0",



      delivery: "",



      notes: "",



    });



  };







  /* ==================================================



     SUCCESS SCREEN



  ================================================== */







  if (sent && lastOrder) {



    return (



      <>



        <style>{`



          .success-page {



            min-height: 80vh;



            display: flex;



            align-items: center;



            justify-content: center;



            padding: 40px 20px;



            background:



              radial-gradient(



                circle at top,



                rgba(197, 160, 89, 0.16),



                transparent 45%



              ),



              #fbf8f3;



          }







          .success-card {



            width: min(700px, 100%);



            background: #ffffff;



            border: 1px solid #e9dfd0;



            border-radius: 24px;



            padding: 38px;



            box-shadow:



              0 20px 60px rgba(43, 34, 23, 0.10);



            text-align: center;



          }







          .success-icon {



            width: 76px;



            height: 76px;



            margin: 0 auto 20px;



            border-radius: 50%;



            display: grid;



            place-items: center;



            background: #f4e8c8;



            color: #8c641c;



          }







          .success-title {



            margin: 0;



            color: #241f1a;



            font-size: 30px;



            font-weight: 800;



          }







          .success-text {



            color: #746b61;



            line-height: 1.7;



            margin: 10px auto 26px;



            max-width: 520px;



          }







          .track-box {



            border: 1px dashed #caa55d;



            background: #fffaf0;



            border-radius: 18px;



            padding: 20px;



            margin: 20px 0;



          }







          .track-label {



            font-size: 12px;



            text-transform: uppercase;



            letter-spacing: 0.12em;



            color: #8b806f;



            margin-bottom: 7px;



          }







          .track-code {



            font-size: 26px;



            font-weight: 900;



            letter-spacing: 0.08em;



            color: #6f4c13;



            word-break: break-word;



          }







          .success-actions {



            display: flex;



            gap: 12px;



            justify-content: center;



            flex-wrap: wrap;



            margin-top: 24px;



          }







          .success-btn {



            border: 0;



            border-radius: 12px;



            padding: 13px 18px;



            cursor: pointer;



            font-weight: 700;



            display: inline-flex;



            align-items: center;



            gap: 8px;



          }







          .success-btn.primary {



            background: #241f1a;



            color: #ffffff;



          }







          .success-btn.whatsapp {



            background: #1d8f4e;



            color: #ffffff;



          }







          .success-btn.secondary {



            background: #f2ede5;



            color: #332b22;



          }







          .success-details {



            text-align: left;



            border-top: 1px solid #eee5d9;



            margin-top: 26px;



            padding-top: 22px;



          }







          .success-row {



            display: flex;



            justify-content: space-between;



            gap: 20px;



            padding: 9px 0;



            border-bottom: 1px solid #f2eee8;



          }







          .success-row span {



            color: #777066;



          }







          .success-row strong {



            color: #29231e;



            text-align: right;



          }







          @media (max-width: 600px) {



            .success-card {



              padding: 24px 18px;



              border-radius: 18px;



            }







            .success-title {



              font-size: 24px;



            }







            .success-row {



              font-size: 14px;



            }



          }



        `}</style>







        <main className="success-page">



          <section className="success-card">



            <div className="success-icon">



              <CheckCircle2 size={42} />



            </div>







            <h1 className="success-title">



              Custom Order Created



            </h1>







            <p className="success-text">



              Your custom jewellery order has



              been successfully saved to the



              database.



            </p>







            <div className="track-box">



              <div className="track-label">



                Order / Tracking Code



              </div>







              <div className="track-code">



                {trackId}



              </div>



            </div>







            <div className="success-actions">



              <button



                className="success-btn primary"



                onClick={



                  copyTrackId



                }



              >



                <Copy size={17} />







                {copied



                  ? "Copied"



                  : "Copy Track Code"}



              </button>







              <button



                className="success-btn whatsapp"



                onClick={() =>



                  openWhatsApp(



                    lastOrder



                  )



                }



              >



                <MessageCircle



                  size={17}



                />







                WhatsApp Customer



              </button>







              <button



                className="success-btn secondary"



                onClick={



                  createAnotherOrder



                }



              >



                <Send size={17} />







                New Order



              </button>



            </div>







            <div className="success-details">



              <div className="success-row">



                <span>



                  Customer



                </span>







                <strong>



                  {lastOrder.customer}



                </strong>



              </div>







              <div className="success-row">



                <span>



                  Jewellery



                </span>







                <strong>



                  {lastOrder.jewellery}



                </strong>



              </div>







              <div className="success-row">



                <span>



                  Purity



                </span>







                <strong>



                  {lastOrder.purity}



                </strong>



              </div>







              <div className="success-row">



                <span>



                  Weight



                </span>







                <strong>



                  {lastOrder.weight} g



                </strong>



              </div>

              <div className="success-row">
                <span>Wastage</span>
                <strong>{lastOrder.wastage}%</strong>
              </div>







              <div className="success-row">



                <span>



                  Estimated Total



                </span>







                <strong>



                  {money(



                    lastOrder.total



                  )}



                </strong>



              </div>







              <div className="success-row">



                <span>



                  Advance



                </span>







                <strong>



                  {money(



                    lastOrder.advance



                  )}



                </strong>



              </div>







              <div className="success-row">



                <span>



                  Balance



                </span>







                <strong>



                  {money(



                    lastOrder.balance



                  )}



                </strong>



              </div>







              <div className="success-row">



                <span>



                  Delivery Date



                </span>







                <strong>



                  {lastOrder.deliveryDate ||



                    "To be confirmed"}



                </strong>



              </div>



            </div>



          </section>



        </main>



      </>



    );



  }







  /* ==================================================



     MAIN PAGE STYLES



  ================================================== */







  return (



    <>



      <style>{`



        .custom-page {



          min-height: 100vh;



          background:



            radial-gradient(



              circle at 10% 0%,



              rgba(199, 166, 99, 0.12),



              transparent 35%



            ),



            #fbf8f3;



          padding-bottom: 70px;



        }







        .custom-page \\* {



          box-sizing: border-box;



        }







        .custom-container {



          width: min(1180px, calc(100% - 32px));



          margin: 0 auto;



        }







        .custom-topbar {



          padding: 24px 0 10px;



        }







        .back-button {



          border: 0;



          background: transparent;



          color: #665c50;



          cursor: pointer;



          display: inline-flex;



          align-items: center;



          gap: 7px;



          padding: 7px 0;



          font-weight: 700;



        }







        .custom-hero {



          padding: 25px 0 35px;



        }







        .eyebrow {



          display: inline-flex;



          align-items: center;



          gap: 7px;



          color: #896321;



          background: #f5ead0;



          border: 1px solid #ead9b2;



          border-radius: 999px;



          padding: 7px 12px;



          font-size: 12px;



          font-weight: 800;



          text-transform: uppercase;



          letter-spacing: 0.08em;



        }







        .custom-title {



          margin: 15px 0 8px;



          font-size: clamp(32px, 5vw, 54px);



          line-height: 1.04;



          color: #211c17;



          font-weight: 900;



        }







        .custom-subtitle {



          margin: 0;



          max-width: 700px;



          color: #746b61;



          line-height: 1.7;



          font-size: 16px;



        }







        .custom-layout {



          display: grid;



          grid-template-columns:



            minmax(0, 1.6fr)



            minmax(310px, 0.9fr);



          gap: 24px;



          align-items: start;



        }







        .form-card {



          background: #ffffff;



          border: 1px solid #e9dfd0;



          border-radius: 22px;



          overflow: hidden;



          box-shadow:



            0 15px 45px rgba(50, 38, 24, 0.06);



        }







        .form-section {



          padding: 25px;



          border-bottom: 1px solid #eee6dc;



        }







        .form-section:last-child {



          border-bottom: 0;



        }







        .section-heading {



          display: flex;



          align-items: flex-start;



          gap: 12px;



          margin-bottom: 20px;



        }







        .section-icon {



          flex: 0 0 auto;



          width: 40px;



          height: 40px;



          border-radius: 12px;



          display: grid;



          place-items: center;



          background: #f7ecd3;



          color: #896321;



        }







        .section-heading h2 {



          margin: 0;



          color: #2a241e;



          font-size: 18px;



        }







        .section-heading p {



          margin: 4px 0 0;



          color: #81786e;



          font-size: 13px;



          line-height: 1.5;



        }







        .form-grid {



          display: grid;



          grid-template-columns:



            repeat(2, minmax(0, 1fr));



          gap: 17px;



        }







        .form-grid.three {



          grid-template-columns:



            repeat(3, minmax(0, 1fr));



        }







        .admin-field {



          display: flex;



          flex-direction: column;



          gap: 7px;



        }







        .admin-field > span {



          font-size: 12px;



          color: #625a51;



          font-weight: 800;



        }







        .input {



          width: 100%;



          min-height: 45px;



          border: 1px solid #ddd2c3;



          border-radius: 11px;



          background: #fffdfa;



          padding: 10px 12px;



          color: #28221d;



          outline: none;



          font: inherit;



        }







        .input:focus {



          border-color: #b58b43;



          box-shadow:



            0 0 0 3px rgba(



              181,



              139,



              67,



              0.12



            );



        }







        .textarea {



          resize: vertical;



          min-height: 120px;



        }







        .rate-box {



          border: 1px solid #eadbbd;



          background: #fffaf0;



          border-radius: 14px;



          padding: 13px 15px;



          display: flex;



          align-items: center;



          justify-content: space-between;



          gap: 12px;



        }







        .rate-box-label {



          color: #766b5e;



          font-size: 12px;



          font-weight: 700;



        }







        .rate-box-value {



          color: #6d4d16;



          font-size: 18px;



          font-weight: 900;



        }







        .rate-error {



          margin-top: 7px;



          color: #a33d32;



          font-size: 12px;



          line-height: 1.5;



        }







        .estimate-sticky {



          position: sticky;



          top: 18px;



        }







        .estimate-card {



          background: #211c17;



          color: #ffffff;



          border-radius: 22px;



          overflow: hidden;



          box-shadow:



            0 20px 55px rgba(



              31,



              24,



              17,



              0.18



            );



        }







        .estimate-header {



          padding: 22px 22px 18px;



          display: flex;



          align-items: center;



          justify-content: space-between;



          gap: 15px;



          border-bottom: 1px solid rgba(



            255,



            255,



            255,



            0.1



          );



        }







        .estimate-header h2 {



          margin: 0;



          font-size: 23px;



        }







        .estimate-header p {



          margin: 4px 0 0;



          color: #cfc5b7;



          font-size: 12px;



        }







        .estimate-gem {



          width: 42px;



          height: 42px;



          border-radius: 13px;



          display: grid;



          place-items: center;



          background: rgba(



            206,



            171,



            96,



            0.18



          );



          color: #e3c27e;



        }







        .estimate-lines {



          padding: 10px 22px;



        }







        .estimate-row {



          display: flex;



          justify-content: space-between;



          gap: 15px;



          padding: 10px 0;



          border-bottom: 1px solid rgba(



            255,



            255,



            255,



            0.08



          );



          font-size: 13px;



        }







        .estimate-row span {



          color: #c7bdb0;



        }







        .estimate-row strong {



          color: #ffffff;



          text-align: right;



        }







        .estimate-row\.total {



          margin-top: 7px;



          padding-top: 15px;



          border-top: 1px solid rgba(



            255,



            255,



            255,



            0.18



          );



        }







        .estimate-row\.total strong {



          color: #e5c57f;



          font-size: 19px;



        }







        .estimate-row\.balance strong {



          color: #ffffff;



          font-size: 16px;



        }







        .estimate-note {



          margin: 5px 22px 0;



          border-radius: 12px;



          padding: 11px 12px;



          background: rgba(



            255,



            255,



            255,



            0.055



          );



          color: #bdb3a7;



          font-size: 11px;



          line-height: 1.55;



        }







        .estimate-actions {



          padding: 20px 22px 22px;



        }







        .create-button {



          width: 100%;



          min-height: 48px;



          border: 0;



          border-radius: 12px;



          background: #d5ad5f;



          color: #211c17;



          cursor: pointer;



          font-weight: 900;



          display: inline-flex;



          justify-content: center;



          align-items: center;



          gap: 8px;



        }







        .create-button:disabled {



          cursor: not-allowed;



          opacity: 0.55;



        }







        .security-note {



          margin-top: 10px;



          color: #a99e91;



          font-size: 11px;



          display: flex;



          justify-content: center;



          align-items: center;



          gap: 5px;



        }







        .custom-info-strip {



          margin-top: 15px;



          background: #ffffff;



          border: 1px solid #e9dfd0;



          border-radius: 18px;



          padding: 16px;



          display: grid;



          gap: 13px;



        }







        .info-item {



          display: flex;



          gap: 10px;



          align-items: flex-start;



        }







        .info-item > svg {



          color: #9b7127;



          flex: 0 0 auto;



          margin-top: 2px;



        }







        .info-item div {



          display: flex;



          flex-direction: column;



          gap: 2px;



        }







        .info-item strong {



          color: #302820;



          font-size: 13px;



        }







        .info-item span {



          color: #82786c;



          font-size: 11px;



        }







        .spin {



          animation:



            spin 0.9s linear infinite;



        }







        @keyframes spin {



          to {



            transform: rotate(360deg);



          }



        }







        @media (max-width: 900px) {



          .custom-layout {



            grid-template-columns: 1fr;



          }







          .estimate-sticky {



            position: static;



          }



        }







        @media (max-width: 650px) {



          .custom-container {



            width: min(



              100% - 20px,



              1180px



            );



          }







          .custom-hero {



            padding-top: 15px;



          }







          .custom-title {



            font-size: 34px;



          }







          .form-section {



            padding: 18px;



          }







          .form-grid,



          .form-grid.three {



            grid-template-columns: 1fr;



          }







          .estimate-header,



          .estimate-lines,



          .estimate-actions {



            padding-left: 17px;



            padding-right: 17px;



          }







          .estimate-note {



            margin-left: 17px;



            margin-right: 17px;



          }



        }



      `}</style>







      <main className="custom-page">



        <div className="custom-container">







          {/* =========================================



              BACK



          ========================================= */}







          <div className="custom-topbar">



            <button



              className="back-button"



              type="button"



              onClick={() =>



                setView({



                  name: "home",



                })



              }



            >



              <ArrowLeft size={17} />



              Back to Home



            </button>



          </div>







          {/* =========================================



              HERO



          ========================================= */}







          <section className="custom-hero">



            <div className="eyebrow">



              <Sparkles size={14} />



              Custom Jewellery



            </div>







            <h1 className="custom-title">



              Create Your Custom Order



            </h1>







            <p className="custom-subtitle">



              Enter the customer's jewellery



              requirements, calculate the



              estimated value, save the order



              to PostgreSQL, and generate a



              unique tracking code.



            </p>



          </section>







          {/* =========================================



              MAIN LAYOUT



          ========================================= */}







          <div className="custom-layout">







            {/* ======================================



                FORM



            ====================================== */}







            <form



              id="custom-order-form"



              className="form-card"



              onSubmit={submit}



            >







              {/* CUSTOMER */}


              <section className="form-section">


                <div className="section-heading">


                  <div className="section-icon">


                    <User size={19} />


                  </div>


                  <div>


                    <h2>


                      Customer Details


                    </h2>


                    <p>


                      Enter the customer's basic


                      information.


                    </p>


                  </div>


                </div>


                <div className="form-grid">


                  <label className="admin-field">


                    <span>


                      Customer Name *


                    </span>


                    <input


                      className="input"


                      type="text"


                      placeholder="Customer name"


                      value={


                        form.name


                      }


                      onChange={(e) =>


                        updateField(


                          "name",


                          e.target.value


                        )


                      }


                      required


                    />


                  </label>


                  <label className="admin-field">


                    <span>


                      Mobile Number *


                    </span>


                    <input


                      className="input"


                      type="tel"


                      inputMode="numeric"


                      maxLength="10"


                      placeholder="10-digit mobile number"


                      value={


                        form.phone


                      }


                      onChange={(e) =>


                        updateField(


                          "phone",


                          e.target.value


                            .replace(


                              /\D/g,


                              ""


                            )


                            .slice(0, 10)


                        )


                      }


                      required


                    />


                  </label>


                </div>


              </section>



{/* JEWELLERY */}







              <section className="form-section">







                <div className="section-heading">







                  <div className="section-icon">



                    <Gem size={19} />



                  </div>







                  <div>



                    <h2>



                      Jewellery Details



                    </h2>







                    <p>



                      Select jewellery type,



                      purity and weight.



                    </p>



                  </div>







                </div>







                <div className="form-grid">







                  <label className="admin-field">







                    <span>



                      Jewellery Type \\*



                    </span>







                    <select



                      className="input"



                      value={



                        form.jewellery



                      }



                      onChange={(e) =>



                        updateField(



                          "jewellery",



                          e.target.value



                        )



                      }



                    >



                      {JEWELLERY_TYPES.map(



                        (item) => (



                          <option



                            key={item}



                            value={item}



                          >



                            {item}



                          </option>



                        )



                      )}



                    </select>







                  </label>







                  <label className="admin-field">







                    <span>



                      Gold Purity \\*



                    </span>







                    <select



                      className="input"



                      value={



                        form.purity



                      }



                      onChange={(e) =>



                        updateField(



                          "purity",



                          e.target.value



                        )



                      }



                    >



                      {PURITIES.map(



                        (item) => (



                          <option



                            key={



                              item.value



                            }



                            value={



                              item.value



                            }



                          >



                            {item.label}



                          </option>



                        )



                      )}



                    </select>







                  </label>







                  <label className="admin-field">







                    <span>



                      Weight (grams) \\*



                    </span>







                    <input



                      className="input"



                      type="number"



                      min="0"



                      step="0.001"



                      placeholder="0.000"



                      value={



                        form.weight



                      }



                      onChange={(e) =>



                        updateField(



                          "weight",



                          e.target.value



                        )



                      }



                      required



                    />







                  </label>







                  <div className="admin-field">







                    <span>



                      Current Gold Rate



                    </span>







                    <div className="rate-box">







                      <span className="rate-box-label">



                        {form.purity}{" "}



                        per gram



                      </span>







                      <strong className="rate-box-value">



                        {rateLoading



                          ? "Loading..."



                          : calculation.goldRate



                          ? money(



                              calculation.goldRate



                            )



                          : "Unavailable"}



                      </strong>







                    </div>







                    {rateError && (



                      <div className="rate-error">



                        {rateError}



                      </div>



                    )}







                  </div>







                </div>







              </section>







              {/* CHARGES */}







              <section className="form-section">







                <div className="section-heading">







                  <div className="section-icon">



                    <CircleDollarSign



                      size={19}



                    />



                  </div>







                  <div>



                    <h2>



                      Charges & Payment



                    </h2>







                    <p>



                      Add making, stone,



                      other charges and advance.



                    </p>



                  </div>







                </div>







                <div className="form-grid three">







                  <label className="admin-field">







                    <span>



                      Making Charge / gram



                    </span>







                    <input



                      className="input"



                      type="number"



                      min="0"



                      step="1"



                      value={



                        form.makingCharge



                      }



                      onChange={(e) =>



                        updateField(



                          "makingCharge",



                          e.target.value



                        )



                      }



                    />







                  </label>

          <label className="admin-field">

            <span>
              Wastage · %
            </span>

            <input
              className="input"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="Example: 6"
              value={form.wastage}
              onChange={(e) =>
                updateField("wastage", e.target.value)
              }
            />

          </label>







                  <label className="admin-field">







                    <span>



                      Stone Charge



                    </span>







                    <input



                      className="input"



                      type="number"



                      min="0"



                      step="1"



                      value={



                        form.stoneCharge



                      }



                      onChange={(e) =>



                        updateField(



                          "stoneCharge",



                          e.target.value



                        )



                      }



                    />







                  </label>







                  <label className="admin-field">







                    <span>



                      Other Charge



                    </span>







                    <input



                      className="input"



                      type="number"



                      min="0"



                      step="1"



                      value={



                        form.otherCharge



                      }



                      onChange={(e) =>



                        updateField(



                          "otherCharge",



                          e.target.value



                        )



                      }



                    />







                  </label>







                  <label className="admin-field">







                    <span>



                      Advance



                    </span>







                    <input



                      className="input"



                      type="number"



                      min="0"



                      step="1"



                      value={



                        form.advance



                      }



                      onChange={(e) =>



                        updateField(



                          "advance",



                          e.target.value



                        )



                      }



                    />







                  </label>







                  <label className="admin-field">







                    <span>



                      Preferred Delivery Date



                    </span>







                    <input



                      className="input"



                      type="date"



                      value={



                        form.delivery



                      }



                      onChange={(e) =>



                        updateField(



                          "delivery",



                          e.target.value



                        )



                      }



                    />







                  </label>







                </div>







              </section>







              {/* NOTES */}







              <section className="form-section">







                <div className="section-heading">







                  <div className="section-icon">



                    <Clipboard size={19} />



                  </div>







                  <div>



                    <h2>



                      Design Notes



                    </h2>







                    <p>



                      Add customer requirements



                      or special instructions.



                    </p>



                  </div>







                </div>







                <label className="admin-field">







                  <span>



                    Design / Notes



                  </span>







                  <textarea



                    className="input textarea"



                    rows="5"



                    placeholder="Example: 22K ring, round stone, size 18, traditional design..."



                    value={



                      form.notes



                    }



                    onChange={(e) =>



                      updateField(



                        "notes",



                        e.target.value



                      )



                    }



                  />







                </label>







              </section>







              {/* MOBILE CREATE BUTTON */}







              <button



                className="create-button"



                type="submit"



                disabled={



                  saving ||



                  rateLoading



                }



                style={{



                  display: "none",



                }}



              >



                {saving ? (



                  <Loader2



                    size={18}



                    className="spin"



                  />



                ) : (



                  <Send size={17} />



                )}







                {saving



                  ? "Creating Order..."



                  : "Create Custom Order"}



              </button>







            </form>







            {/* ======================================



                RIGHT ESTIMATE



            ====================================== */}







            <aside className="estimate-sticky">







              <div className="estimate-card">







                <div className="estimate-header">







                  <div>







                    <h2 className="display-font">



                      Your Estimate



                    </h2>







                    <p>



                      Live calculation



                    </p>







                  </div>







                  <div className="estimate-gem">



                    <Sparkles size={19} />



                  </div>







                </div>







                <div className="estimate-lines">







                  <div className="estimate-row">



                    <span>



                      Jewellery



                    </span>







                    <strong>



                      {form.jewellery}



                    </strong>



                  </div>







                  <div className="estimate-row">



                    <span>



                      Purity



                    </span>







                    <strong>



                      {form.purity}



                    </strong>



                  </div>







                  <div className="estimate-row">



                    <span>



                      Weight



                    </span>







                    <strong>



                      {calculation.weight.toFixed(



                        3



                      )} g



                    </strong>



                  </div>







                  <div className="estimate-row">



                    <span>



                      Gold Rate



                    </span>







                    <strong>



                      {money(



                        calculation.goldRate



                      )}



                      /g



                    </strong>



                  </div>







                  <div className="estimate-row">



                    <span>



                      Gold Value



                    </span>







                    <strong>



                      {money(



                        calculation.goldValue



                      )}



                    </strong>



                  </div>







                  <div className="estimate-row">



                    <span>



                      Making Charge



                    </span>







                    <strong>



                      {money(



                        calculation.makingAmount



                      )}



                    </strong>



                  </div>

          <div className="estimate-row">
            <span>Wastage</span>
            <strong>{numberValue(form.wastage)}%</strong>
          </div>







                  <div className="estimate-row">



                    <span>



                      Stone Charge



                    </span>







                    <strong>



                      {money(



                        calculation.stoneCharge



                      )}



                    </strong>



                  </div>







                  <div className="estimate-row">



                    <span>



                      Other Charge



                    </span>







                    <strong>



                      {money(



                        calculation.otherCharge



                      )}



                    </strong>



                  </div>







                  <div className="estimate-row total">



                    <span>



                      Estimated Total



                    </span>







                    <strong>



                      {money(



                        calculation.total



                      )}



                    </strong>



                  </div>







                  <div className="estimate-row">



                    <span>



                      Advance



                    </span>







                    <strong>



                      {money(



                        calculation.advance



                      )}



                    </strong>



                  </div>







                  <div className="estimate-row balance">



                    <span>



                      Balance



                    </span>







                    <strong>



                      {money(



                        calculation.balance



                      )}



                    </strong>



                  </div>







                </div>







                <div className="estimate-note">



                  Final jewellery price may vary



                  according to the actual weight,



                  final gold rate, stones, design,



                  and applicable charges at the



                  time of completion.



                </div>







                <div className="estimate-actions">







                  <button



                    className="create-button"



                    type="submit"



                    form="custom-order-form"



                    disabled={



                      saving ||



                      rateLoading



                    }



                  >



                    {saving ? (



                      <Loader2



                        size={18}



                        className="spin"



                      />



                    ) : (



                      <Send size={17} />



                    )}







                    {saving



                      ? "Creating Order..."



                      : rateLoading



                      ? "Loading Gold Rate..."



                      : "Create Custom Order"}



                  </button>







                  <div className="security-note">



                    <CheckCircle2



                      size={12}



                    />



                    Order saved to PostgreSQL



                  </div>







                </div>







              </div>







              <div className="custom-info-strip">







                <div className="info-item">







                  <Gem size={17} />







                  <div>







                    <strong>



                      Custom Design



                    </strong>







                    <span>



                      Made to your requirements



                    </span>







                  </div>







                </div>







                <div className="info-item">







                  <PackageCheck



                    size={17}



                  />







                  <div>







                    <strong>



                      Trackable Order



                    </strong>







                    <span>



                      Receive a unique code



                    </span>







                  </div>







                </div>







                <div className="info-item">







                  <MessageCircle



                    size={17}



                  />







                  <div>







                    <strong>



                      WhatsApp



                    </strong>







                    <span>



                      Order details ready to send



                    </span>







                  </div>







                </div>







              </div>







            </aside>







          </div>







        </div>



      </main>



    </>



  );



}