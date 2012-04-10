using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Ajax;
using System.Xml;
using policyDB.EntityClasses;
using policyDB.CollectionClasses;
using policyDB.HelperClasses;
using System.IO;
using PolicyBuilder.Models;

namespace PolicyBuilder.Controllers
{
    public class importController : Controller
    {
        private AttributeEntity m_literalAttribute = new AttributeEntity();

        //
        // GET: /import/

        public ActionResult Index(baseData vData)
        {
            return View();
        }

        public ActionResult ImportBondiSVN(baseData vData)
        {
            try
            {
                policyController.DeleteEntireLibrary(vData.Library.Id);
                importFolder(vData);
            }
            catch (Exception ex)
            {
                TempData["message"] = ex.Message;
            }

            return RedirectToAction("Index", "policy");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Import(baseData vData, FormCollection collection)
        {
            if (Request.Files.Count > 0)
            {
                // Save the uploaded file.
                string path = string.Format("~/imports/{0}.xml", Path.GetRandomFileName());
                string mappedPath = Server.MapPath(path);

                Request.Files[0].SaveAs(mappedPath);

                try
                {
                    string title = Path.GetFileName(Request.Files[0].FileName);
                    if (Path.GetExtension(title) == ".xml" || Path.GetExtension(title) == ".conf")
                        title = Path.GetFileNameWithoutExtension(title);

                    PolicyDocumentEntity pde = importFile(vData,title, mappedPath);

                    return RedirectToAction("EditPolicyDoc", "policy", new { id = pde.Id });
                }
                catch (Exception ex)
                {
                    TempData["error"] = ex.Message;
                }
            }
            else
            {
                TempData["message"] = "select a file to upload";
            }

            return RedirectToAction("Index","policy");
        }

        private void importFolder(baseData vData)
        {
            string importFrom = Server.MapPath("~/bondiSVN");

            LibraryEntity li = vData.Library;
            li.Name = string.Format("Bondi SVN import at {0}", DateTime.Now.ToString("dd-MM-yyyy hh:mm:ss"));
            li.Save();

            DirectoryInfo di = new DirectoryInfo(importFrom);
            FileInfo[] files = di.GetFiles("*.*");

            foreach (FileInfo fi in files)
            {
                try
                {
                    importFile(vData, fi.Name, fi.FullName);
                }
                catch (Exception ex)
                {

                }
            }
        }

        private PolicyDocumentEntity importFile(baseData vData,string title, string filepath)
        {
            AttributeCollection acoll = new AttributeCollection();
            acoll.GetMulti(AttributeFields.Name == "Literal");
            if (acoll.Count == 0)
                throw new Exception("can't find literal attribute");
            m_literalAttribute = acoll[0];

            XmlDocument doc = new XmlDocument();
            doc.Load(filepath);

            PolicyDocumentEntity pde = new PolicyDocumentEntity();
            pde.LibraryId = vData.Library.Id;
            pde.Name = title;

            PolicyLinkEntity ple = new PolicyLinkEntity();
            ple.Policy = new PolicyEntity();
            ple.Policy.LibraryId = pde.LibraryId;
            pde.PolicyLink = ple;

            XmlNode policySet = doc.SelectSingleNode("policy-set");
            if (policySet != null)
                loadPolicySet(1,title,ple,policySet);
            else
            {
                XmlNode policy = doc.SelectSingleNode("policy");
                loadPolicy(1,title,ple,policy);
            }

            pde.Save(true);

            return pde;
        }

        private void loadPolicyBase(int idx, string title,PolicyEntity pe,XmlNode node)
        {
            XmlNode attr = node.Attributes.GetNamedItem("combine");
            string combine = "deny-overrides";
            if (attr != null)
		        combine = attr.Value;

            CombineModeCollection cmcoll = new CombineModeCollection();
            cmcoll.GetMulti((CombineModeFields.Name == combine));

            if (cmcoll.Count != 1)
                throw new Exception(string.Format("unrecognised policy combine mode: {0}", combine));

            attr = node.Attributes.GetNamedItem("description");
            if (attr != null)
                pe.Description = attr.Value;
            else
            {
                if (pe.Set)
                    pe.Description = string.Format("{0}-set-{1}", title, idx);
                else
                    pe.Description = string.Format("{0}-policy-{1}", title, idx);
            }
            
            pe.CombineMode = cmcoll[0];
            pe.Uid = Guid.NewGuid();

            XmlNode target = node.SelectSingleNode("target");
            loadTarget(pe,target);
        }

        private void loadPolicySet(int idx,string title,PolicyLinkEntity ple, XmlNode node)
        {
            ple.Policy.Set = true;

            loadPolicyBase(idx,title,ple.Policy, node);

            int policyCount = 0;
            int policySetCount = 0;
            foreach (XmlNode kid in node.ChildNodes)
            {
                if (kid.LocalName != "policy" && kid.LocalName != "policy-set")
                    continue;

                PolicyLinkEntity pleKid = new PolicyLinkEntity();
                pleKid.Order = policyCount + policySetCount;
                pleKid.Parent = ple;
                pleKid.Policy = new PolicyEntity();
                pleKid.Policy.LibraryId = ple.Policy.LibraryId;

                if (kid.NodeType == XmlNodeType.Element && kid.LocalName == "policy")
                {
                    loadPolicy(++policyCount, ple.Policy.Description, pleKid, kid);
                }
                else if (kid.NodeType == XmlNodeType.Element && kid.LocalName == "policy-set")
                {
                    loadPolicySet(++policySetCount, ple.Policy.Description,pleKid, kid);
                }
            }
        }

        private void loadPolicy(int idx,string title,PolicyLinkEntity ple, XmlNode node)
        {
            loadPolicyBase(idx,title,ple.Policy, node);

            XmlNodeList rules = node.SelectNodes("rule");
            int ruleIdx = 0;
            foreach (XmlNode rule in rules)
            {
                loadRule(ruleIdx, ple.Policy, rule);
                ruleIdx++;
            }
        }

        private void loadRule(int idx,PolicyEntity pe, XmlNode node)
        {
            RuleEntity re = new RuleEntity();
            re.Policy = pe;
            re.Order = idx;

            string effect = "permit";
            XmlNode attr = node.Attributes.GetNamedItem("effect");
            if (attr != null)
                effect = attr.Value;

            EffectCollection ecoll = new EffectCollection();
            ecoll.GetMulti(EffectFields.Name == effect);
            if (ecoll.Count != 1)
                throw new Exception(string.Format("unrecognised rule effect {0}", effect));
            re.Effect = ecoll[0];

            DecisionNodeEntity ce = new DecisionNodeEntity();
            re.Condition = ce;
            ce.Type = constants.conditionType;
            ce.IsDirty = true;

            XmlNode condition = node.SelectSingleNode("condition");
            if (condition != null)
                loadCondition(ce, condition);
        }

        private void loadTarget(PolicyEntity pe, XmlNode node)
        {
            pe.Target = new TargetEntity();
            pe.Target.IsDirty = true;

            if (node != null)
            {
                XmlNodeList subjects = node.SelectNodes("subject");
                foreach (XmlNode subject in subjects)
                    loadSubject(pe.Target, subject);
            }
        }

        private void loadSubject(TargetEntity te, XmlNode node)
        {
            DecisionNodeEntity ce = new DecisionNodeEntity();

            TargetConditionEntity tce = new TargetConditionEntity();
            tce.Target = te;
            tce.DecisionNode = ce;

            loadCondition(ce, node);
        }

        private void loadCondition(DecisionNodeEntity ce,XmlNode node)
        {
            ce.Type = constants.conditionType;
            XmlNode attr = node.Attributes.GetNamedItem("combine");
            if (attr == null || attr.Value == "and")
                ce.CombineAnd = true;
            else
                ce.CombineAnd = false;

            int matchIdx = 0;

            foreach (XmlNode child in node.ChildNodes)
            {
                if (child.NodeType != XmlNodeType.Element)
                    continue;

                switch (child.LocalName)
                {
                    case "condition":
                        DecisionNodeEntity ceChild = new DecisionNodeEntity();
                        ceChild.Parent = ce;
                        ceChild.Order = matchIdx++;
                        loadCondition(ceChild,child);
                        break;
                    case "resource-match":
                    case "environment-match":
                    case "subject-match":
                        loadMatch(matchIdx++, ce, child);
                        break;
                }
            }
        }

        private void resolveAttribute(string inp, out string attr, out string extra)
        {
            int idx = inp.IndexOf('.');
            if (idx == -1)
                idx = inp.IndexOf(':');

            if (idx >= 0)
            {
                attr = inp.Substring(0, idx);
                extra = inp.Substring(idx + 1);
            }
            else
            {
                attr = inp;
                extra = string.Empty;
            }
        }

        private void loadMatch(int idx,DecisionNodeEntity ce, XmlNode node)
        {
            DecisionNodeEntity ame = new DecisionNodeEntity();
            ame.Type = constants.attributeMatchType;
            ame.Parent = ce;
            ame.Order = idx;

            XmlNode attr = node.Attributes.GetNamedItem("attr");
            if (attr == null)
                throw new Exception(string.Format("attr attribute missing from node: {0}", node.InnerXml));

            AttributeCollection acoll = new AttributeCollection();
            string attrVal;
            string attrExtra;
            resolveAttribute(attr.Value, out attrVal, out attrExtra);

            acoll.GetMulti(AttributeFields.Name == attrVal);
            if (acoll.Count == 0)
                throw new Exception(string.Format("unknown attribute {0} (toby please fix this)", attrVal));

            ame.Attribute = acoll[0];
            ame.Extra = attrExtra;

            attr = node.Attributes.GetNamedItem("match");
            if (attr != null)
            {
                AttributeValueEntity ave = new AttributeValueEntity();
                ave.Order = 0;
                ave.Attribute = m_literalAttribute;
                ave.Value = attr.Value;
                ave.AttributeMatch = ame;
            }
            else
            {
                int valueIdx = 0;
                foreach (XmlNode kid in node.ChildNodes)
                {
                    switch (kid.NodeType)
                    {
                        case XmlNodeType.Text:
                            {
                                AttributeValueEntity ave = new AttributeValueEntity();
                                ave.Order = valueIdx;
                                ave.Attribute = m_literalAttribute;
                                ave.Value = kid.Value.Trim();
                                ave.AttributeMatch = ame;
                            }
                            break;
                        case XmlNodeType.Element:
                            {
                                switch (kid.LocalName)
                                {
                                    case "environment-attr":
                                        loadAttributeValue(valueIdx, ame, kid);
                                        break;
                                    case "resource-attr":
                                        loadAttributeValue(valueIdx, ame, kid);
                                        break;
                                    case "subject-attr":
                                        loadAttributeValue(valueIdx, ame, kid);
                                        break;
                                    default:
                                        throw new Exception(string.Format("unknown attribute value type: {0}", kid.LocalName));
                                        break;
                                }
                            }
                            break;
                        default:
                            break;
                    }
                    valueIdx++;
                }
            }

        }

        private void loadAttributeValue(int idx,DecisionNodeEntity ame, XmlNode node)
        {
            XmlNode attr = node.Attributes.GetNamedItem("attr");
            if (attr == null)
                throw new Exception(string.Format("attr attribute missing from node: {0}", node.InnerXml));

            string attrVal;
            string attrExtra;
            resolveAttribute(attr.Value, out attrVal, out attrExtra);

            AttributeCollection acoll = new AttributeCollection();
            acoll.GetMulti(AttributeFields.Name == attrVal);
            if (acoll.Count == 0)
                throw new Exception(string.Format("unknown attribute {0} (toby please fix this)", attrVal));

            AttributeValueEntity ave = new AttributeValueEntity();
            ave.Order = idx;
            ave.Attribute = acoll[0];
            ave.Value = attr.Value.Trim();
            ave.AttributeMatch = ame;
        }
    }
}
