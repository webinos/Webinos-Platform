///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:06
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Collections;
using System.Collections.Generic;
using policyDB;
using policyDB.FactoryClasses;
using policyDB.HelperClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.RelationClasses
{
	/// <summary>Implements the static Relations variant for the entity: Rule. </summary>
	public partial class RuleRelations
	{
		/// <summary>CTor</summary>
		public RuleRelations()
		{
		}

		/// <summary>Gets all relations of the RuleEntity as a list of IEntityRelation objects.</summary>
		/// <returns>a list of IEntityRelation objects</returns>
		public virtual List<IEntityRelation> GetAllRelations()
		{
			List<IEntityRelation> toReturn = new List<IEntityRelation>();


			toReturn.Add(this.DecisionNodeEntityUsingConditionId);
			toReturn.Add(this.EffectEntityUsingEffectId);
			toReturn.Add(this.PolicyEntityUsingPolicyId);
			return toReturn;
		}

		#region Class Property Declarations



		/// <summary>Returns a new IEntityRelation object, between RuleEntity and DecisionNodeEntity over the m:1 relation they have, using the relation between the fields:
		/// Rule.ConditionId - DecisionNode.Id
		/// </summary>
		public virtual IEntityRelation DecisionNodeEntityUsingConditionId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Condition", false);
				relation.AddEntityFieldPair(DecisionNodeFields.Id, RuleFields.ConditionId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("DecisionNodeEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("RuleEntity", true);
				return relation;
			}
		}
		/// <summary>Returns a new IEntityRelation object, between RuleEntity and EffectEntity over the m:1 relation they have, using the relation between the fields:
		/// Rule.EffectId - Effect.Id
		/// </summary>
		public virtual IEntityRelation EffectEntityUsingEffectId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Effect", false);
				relation.AddEntityFieldPair(EffectFields.Id, RuleFields.EffectId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("EffectEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("RuleEntity", true);
				return relation;
			}
		}
		/// <summary>Returns a new IEntityRelation object, between RuleEntity and PolicyEntity over the m:1 relation they have, using the relation between the fields:
		/// Rule.PolicyId - Policy.Id
		/// </summary>
		public virtual IEntityRelation PolicyEntityUsingPolicyId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Policy", false);
				relation.AddEntityFieldPair(PolicyFields.Id, RuleFields.PolicyId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("RuleEntity", true);
				return relation;
			}
		}

		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSubTypeRelation(string subTypeEntityName) { return null; }
		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSuperTypeRelation() { return null;}

		#endregion

		#region Included Code

		#endregion
	}
}
